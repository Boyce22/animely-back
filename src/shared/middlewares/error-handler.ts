import { Request, Response, NextFunction } from 'express';
import { AppError } from '@errors';
import { logger } from '@utils';
import { env } from '@config';

interface ErrorResponse {
  message: string;
  errors?: Array<{ field: string; message: string }>;
  timestamp?: string;
  path?: string;
  stack?: string;
}

const ERROR_STATUS_MAP: Record<string, number> = {
  QueryFailedError: 400,
  EntityNotFoundError: 404,
  JsonWebTokenError: 401,
  TokenExpiredError: 401,
  ValidationError: 400,
  MulterError: 400,
};

export const errorHandler = (
  error: Error | AppError,
  request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: Array<{ field: string; message: string }> | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  } else if (ERROR_STATUS_MAP[error.name]) {
    statusCode = ERROR_STATUS_MAP[error.name];
    message = env.NODE_ENV === 'production' ? 'Request failed' : error.message;
  } else if (env.NODE_ENV === 'production') {
    message = 'Internal server error';
  } else {
    message = error.message;
  }

  const errorResponse: ErrorResponse = { message };

  if (details && details.length > 0) {
    errorResponse.errors = details;
  }

  if (env.NODE_ENV === 'development') {
    errorResponse.timestamp = new Date().toISOString();
    errorResponse.path = request.path;
    errorResponse.stack = error.stack;
  }

  if (statusCode >= 500) {
    logger.error('Server error', {
      message: error.message,
      statusCode,
      method: request.method,
      path: request.path,
      stack: error.stack,
    });
  } else {
    logger.warn('Client error', {
      message: error.message,
      statusCode,
      method: request.method,
      path: request.path,
    });
  }

  response.status(statusCode).json(errorResponse);
};
