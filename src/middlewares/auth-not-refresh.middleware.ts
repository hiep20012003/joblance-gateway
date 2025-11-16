// src/middlewares/auth.middleware.ts

import {config} from '@gateway/config';
import {cacheStore} from '@gateway/cache/redis.connection';
import {ErrorCode, JwtPayload, UnauthorizedError} from '@hiep20012003/joblance-shared';
import {NextFunction, Request, Response} from 'express';
import jwt, {JsonWebTokenError, JwtHeader} from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import {AppLogger} from '@gateway/utils/logger';

// --- Interfaces ---
interface JwtConfig {
  jwksUri: string;
  algorithms: string[];
  cacheTtl?: number;
}

interface DualJwtConfig extends JwtConfig {
  internalSecret: string; // Thêm secret key để verify Internal Token
}

// --- Hàm trợ giúp chung ---

const getPublicKey = async (kid: string, client: jwksClient.JwksClient) => {
  if (!kid) throw new JsonWebTokenError('Missing kid in JWT header');
  const key = await client.getSigningKey(kid);
  return key.getPublicKey();
};

const verifyJwtToken = (token: string, key: string, algorithms: string[]) => {
  return jwt.verify(token, key, {algorithms: algorithms as jwt.Algorithm[]}) as JwtPayload;
};

const checkBlacklist = async (jti: string) => {
  if (!jti) {
    throw new UnauthorizedError({
      clientMessage: 'Unauthorized',
      logMessage: 'Missing jti',
      errorCode: ErrorCode.TOKEN_INVALID,
    });
  }

  const isBlacklisted = await cacheStore.exists(`blacklist:access:${jti}`);
  if (isBlacklisted) {
    throw new UnauthorizedError({
      clientMessage: 'Token revoked',
      logMessage: `jti ${jti} blacklisted`,
      errorCode: ErrorCode.TOKEN_REVOKED,
    });
  }
};

const validateToken = async (
  token: string,
  client: jwksClient.JwksClient,
  algorithms: string[],
): Promise<JwtPayload> => {
  // Decode JWT header
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  const headerJson = Buffer.from(headerB64, 'base64url').toString('utf8');
  const headerObj = JSON.parse(headerJson) as JwtHeader;

  // Lấy public key từ JWKS
  const publicKey = await getPublicKey(headerObj.kid as string, client);

  // Remove version suffix in kid (nếu có)
  const signedHeaderB64 = Buffer.from(
    JSON.stringify({...headerObj, kid: headerObj.kid!.split(':')[0]}),
  ).toString('base64url');
  const signedToken = `${signedHeaderB64}.${payloadB64}.${signatureB64}`;

  // Verify JWT
  const payload = verifyJwtToken(signedToken, publicKey, algorithms);

  // Kiểm tra blacklist
  await checkBlacklist(payload.jti!);

  return payload;
};

// --- Hàm verify Internal Token ---

const verifyInternalToken = (token: string, secret: string): JwtPayload => {
  try {
    // Internal Token thường dùng HS256 và không cần thuật toán phức tạp
    // Jwt.verify tự động tìm thuật toán nếu không chỉ định, nhưng an toàn hơn
    // nếu bạn biết thuật toán internal token dùng. Tuy nhiên, dùng secret
    // key sẽ ép nó dùng thuật toán đối xứng (HS256).
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError({
      clientMessage: 'Unauthorized',
      logMessage: `Internal JWT validation failed: ${(error as Error).message}`,
      errorCode: ErrorCode.TOKEN_INVALID,
      cause: error,
    });
  }
};

// --- Middleware Chính ---

export const createAuthMiddleware = (jwtConfig: DualJwtConfig) => {
  const jwksClientInstance = jwksClient({
    jwksUri: jwtConfig.jwksUri,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: jwtConfig.cacheTtl || 600_000, // 10 phút
  });

  return async (req: Request, _res: Response, next: NextFunction) => {
    const operation = 'middleware:auth';

    // Lấy các loại token
    // Internal Token: Dùng header riêng biệt
    const internalToken = req.headers['x-internal-token'] as string;

    // External Token: Từ Authorization header hoặc Session/Cookie
    const externalToken =
      (req.session?.accessToken as string) ||
      (req.headers.authorization?.split(' ')[1] ?? null);


    try {
      let payload: JwtPayload;

      // ------------------------------------
      // A. KIỂM TRA INTERNAL TOKEN (Ưu tiên)
      // ------------------------------------
      if (internalToken) {

        payload = verifyInternalToken(internalToken, jwtConfig.internalSecret);

        AppLogger.info('Authenticated internal request', {
          operation,
          context: {serviceId: payload.sub, type: 'Internal'},
        });

      }

        // ------------------------------------
        // B. KIỂM TRA EXTERNAL TOKEN
      // ------------------------------------
      else if (externalToken) {
        // Validate External token (verify + blacklist)
        payload = await validateToken(externalToken, jwksClientInstance, jwtConfig.algorithms);

        AppLogger.info('Authenticated external request', {
          operation,
          context: {userId: payload.sub, type: 'External'},
        });

      }

        // ------------------------------------
        // C. KHÔNG CÓ TOKEN NÀO
      // ------------------------------------
      else {
        throw new UnauthorizedError({
          clientMessage: 'Unauthorized',
          logMessage: 'Missing access or internal token',
          operation,
          errorCode: ErrorCode.TOKEN_MISSING,
        });
      }

      req.currentUser = payload;

      return next();

    } catch (err) {
      return next(
        new UnauthorizedError({
          clientMessage: 'Unauthorized',
          logMessage: `JWT validation failed: ${(err as Error).message}`,
          operation,
          errorCode: ErrorCode.TOKEN_INVALID,
          cause: err,
        }),
      );
    }
  };
};

// -------------------------
// Export Middleware instance (sử dụng Secret Key của Gateway cho Internal)
// -------------------------
export const authNotRefreshMiddleware = createAuthMiddleware({
  jwksUri: config.JWKS_URI,
  algorithms: [config.JWT_ALGORITHM],
  internalSecret: config.GATEWAY_SECRET_KEY, // Sử dụng Shared Secret Key
});
