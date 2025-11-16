import {config} from '@gateway/config';
import {cacheStore} from '@gateway/cache/redis.connection';
import {ErrorCode, JwtPayload, UnauthorizedError} from '@hiep20012003/joblance-shared';
import {NextFunction, Request, Response} from 'express';
import jwt, {JsonWebTokenError, JwtHeader, TokenExpiredError} from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import {AuthService} from '@gateway/services/api/auth.service';
import {AppLogger} from '@gateway/utils/logger';
import {generateInternalTokenHeader} from '@gateway/utils/helper';

interface JwtConfig {
  jwksUri: string;
  algorithms: string[];
  cacheTtl?: number;
}

const getPublicKey = async (kid: string, client: jwksClient.JwksClient) => {
  if (!kid) throw new JsonWebTokenError('Missing kid in JWT header');
  const key = await client.getSigningKey(kid);
  return key.getPublicKey();
};

const verifyJwtToken = (token: string, publicKey: string, algorithms: string[]) => {
  return jwt.verify(token, publicKey, {algorithms: algorithms as jwt.Algorithm[]}) as JwtPayload;
};

const checkBlacklist = async (jti: string) => {
  if (!jti) throw new UnauthorizedError({clientMessage: 'Unauthorized', logMessage: 'Missing jti'});
  const isBlacklisted = await cacheStore.exists(`blacklist:access:${jti}`);
  if (isBlacklisted) throw new UnauthorizedError({
    clientMessage: 'Token revoked',
    logMessage: `jti ${jti} blacklisted`,
    errorCode: ErrorCode.TOKEN_REVOKED
  });
};

const validateToken = async (token: string, client: jwksClient.JwksClient, algorithms: string[]): Promise<JwtPayload> => {
  // Decode JWT header
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  const headerJson = Buffer.from(headerB64, 'base64url').toString('utf8');
  const headerObj = JSON.parse(headerJson) as JwtHeader;

  const publicKey = await getPublicKey(headerObj.kid as string, client);

  // Remove version from kid before verify
  const signedHeaderB64 = Buffer.from(
    JSON.stringify({...headerObj, kid: headerObj.kid!.split(':')[0]})
  ).toString('base64url');
  const signedToken = `${signedHeaderB64}.${payloadB64}.${signatureB64}`;

  // Verify JWT
  const payload = verifyJwtToken(signedToken, publicKey, algorithms);

  // Check blacklist
  await checkBlacklist(payload.jti!);

  return payload;
};

export const createAuthMiddleware = (jwtConfig: JwtConfig) => {
  const client = jwksClient({
    jwksUri: jwtConfig.jwksUri,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: jwtConfig.cacheTtl || 600000
  });

  return async (req: Request, _res: Response, next: NextFunction) => {
    const operation = 'middleware:auth';

    const token = req.session?.accessToken as string ?? req.headers.authorization!.split(' ')[1];
    // const token = null;
    if (!token) return next(new UnauthorizedError({
      clientMessage: 'Unauthorized',
      logMessage: 'No token',
      operation,
      errorCode: ErrorCode.TOKEN_MISSING
    }));
    try {
      // Validate token (verify + blacklist)
      req.currentUser = await validateToken(token, client, jwtConfig.algorithms);
      return next();
    } catch (err) {
      // If token expired, refresh
      if (err instanceof TokenExpiredError) {
        try {
          const payload = jwt.decode(token) as JwtPayload;
          const refreshToken: string | null =
            req.session?.refreshToken as string ??
            (await cacheStore.get(`auth:refresh_token:user:${payload.sub}`));

          if (!refreshToken) return Promise.reject(Error('Refresh Token not found'));

          const authService = new AuthService(`${config.AUTH_BASE_URL}/api/v1`);
          const internalToken = await generateInternalTokenHeader({req});
          const response = await authService.setHeader({'x-internal-token': `${internalToken}`}).refreshToken(refreshToken);

          const {token: newAccessToken} = (response.data as Record<string, unknown>)?.accessToken as {
            token: string,
            exp: number
          };
          if (!newAccessToken) return Promise.reject(Error('Cannot get token'));
          req.session = {...req.session, accessToken: newAccessToken};

          // Validate token
          req.currentUser = await validateToken(newAccessToken, client, jwtConfig.algorithms);

          AppLogger.info('Refresh token', {
            operation: `middleware:auth-refresh`, context: {
              userId: req.currentUser.sub
            }
          });
          return next();
        } catch (refreshErr) {
          return next(new UnauthorizedError({
            clientMessage: 'Unauthorized',
            logMessage: `Token refresh failed: ${(refreshErr as Error).message}`,
            operation: 'middleware:auth-refresh',
            errorCode: ErrorCode.TOKEN_EXPIRED,
            cause: refreshErr
          }));
        }
      }

      return next(new UnauthorizedError({
        clientMessage: 'Unauthorized',
        logMessage: `JWT verification failed: ${(err as Error).message}`,
        operation: 'middleware:auth-exception',
        cause: err
      }));
    }
  };
};


export const authWithRefreshMiddleware = createAuthMiddleware({
  jwksUri: config.JWKS_URI,
  algorithms: [`${config.JWT_ALGORITHM}`],
});
