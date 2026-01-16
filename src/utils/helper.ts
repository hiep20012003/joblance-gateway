import { Request } from 'express';
import { JwtPayload } from '@hiep20012003/joblance-shared';
import jwt from 'jsonwebtoken';
import { config } from '@gateway/config';
import FormData from 'form-data';

export const generateInternalTokenHeader = async (
  options: { req?: Request; retryToken?: string }
): Promise<string> => {
  const { req, retryToken } = options;
  const accessToken = req?.session?.accessToken as string;

  let retryTokenPayload: JwtPayload | null = null;
  if (retryToken) {
    retryTokenPayload = jwt.decode(retryToken) as JwtPayload | null;
  }

  let accessTokenPayload: JwtPayload | null = null;
  if (accessToken) {
    accessTokenPayload = jwt.decode(accessToken) as JwtPayload | null;
  }

  const sub = retryTokenPayload?.sub ?? accessTokenPayload?.sub ?? 'guest';

  // Default payload
  let payload: JwtPayload = {
    iss: 'gateway',
    aud: req?.audience ?? retryTokenPayload?.aud ?? '',
    sub: sub
  };

  if (accessTokenPayload?.sub) {
    payload = {
      ...payload,
      sub: accessTokenPayload.sub,
      username: accessTokenPayload.username,
      email: accessTokenPayload.email,
      roles: accessTokenPayload.roles,
    };
  }

  // Merge retryToken payload if exists
  if (retryTokenPayload?.sub) {
    payload = {
      ...payload,
      sub: retryTokenPayload.sub,
      username: retryTokenPayload.username,
      email: retryTokenPayload.email,
      roles: retryTokenPayload.roles,
    };
  }

  // Sign new internal token
  return jwt.sign(payload, config.GATEWAY_SECRET_KEY, {
    expiresIn: Number(config.INTERNAL_TOKEN_EXPIRES_IN),
  });

  // AppLogger.info('Generated new internal token', {operation: 'gateway:internal-token'});
};


type MulterFiles =
  | Express.Multer.File
  | Express.Multer.File[]
  | { [fieldname: string]: Express.Multer.File[] }
  | undefined;

export const createFormData = (req: Request, extras?: Record<string, unknown>) => {
  const body = req.body as Record<string, unknown>;
  const files = req.file || req.files;

  const formData = new FormData();

  function isSingleFile(file: MulterFiles): file is Express.Multer.File {
    return file != null && !Array.isArray(file) && 'fieldname' in file;
  }

  // Append body fields
  for (const [key, value] of Object.entries(body)) {
    formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
  }

  for (const [key, value] of Object.entries(extras ?? {})) {
    formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
  }


  const appendFile = (file: Express.Multer.File) => {
    formData.append(file.fieldname, file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
  };

  if (!files) return formData;

  if (Array.isArray(files)) {
    // multiple files
    files.forEach(appendFile);
  } else if (isSingleFile(files)) {
    // single file
    appendFile(files);
  } else {
    // fields object
    Object.values(files).forEach(fileArray => fileArray.forEach(appendFile));
  }

  return formData;
};


