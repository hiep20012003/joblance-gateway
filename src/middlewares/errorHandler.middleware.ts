import { logger } from '@gateway/app';
import { CustomError, ServerError } from '@hiep20012003/joblance-shared';
import { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof CustomError) {
    logger.error(error);
    res.status(error.statusCode).json(error.serialize());
    return;
  }

  const serverError = new ServerError(
    error instanceof Error ? error.message : 'Unknown error',
    'ErrorHandlerMiddleware'
  );

  logger.error(serverError);

  res.status(serverError.statusCode).json(serverError.serialize());
  return;
};

export default errorHandler;
