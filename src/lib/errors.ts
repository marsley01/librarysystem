export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'AuthError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSeconds: number) {
    super('Too many requests. Please try again later.', 429, 'RATE_LIMITED');
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
  retryAfterSeconds: number;
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: { error: error.message, code: error.code },
      headers: error instanceof RateLimitError
        ? { 'Retry-After': String(error.retryAfterSeconds) }
        : undefined,
    };
  }

  if (error instanceof Error) {
    console.error('Unhandled error:', error);
    return {
      status: 500,
      body: { error: 'Internal server error' },
    };
  }

  return {
    status: 500,
    body: { error: 'Internal server error' },
  };
}
