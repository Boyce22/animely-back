import { AppError } from './app-error';

export class BadRequestError extends AppError {
  constructor(message: string, errors?: Array<{ field: string; message: string }>) {
    super(message, 400, errors);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class MissingFieldsError extends AppError {
  constructor(message = 'Required fields are missing.') {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class PasswordNotMatchError extends AppError {
  constructor(message = 'Passwords do not match.') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class UserNotFoundError extends AppError {
  constructor(message = 'User not found.') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(errors: Array<{ field: string; message: string }>) {
    super('Validation failed', 400, errors);
  }
}

export class RouteNotFound extends AppError {
  constructor(method: string, path: string) {
    const message = `Route ${method} ${path} not found`;
    super(message, 404);
  }
}
