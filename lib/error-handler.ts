/**
 * Global Error Handler
 * Centralized error handling for API routes
 */

import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { errorResponse, ErrorCodes } from './api-response';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, context?: string) {
  // Log error
  if (error instanceof Error) {
    logger.error(error.message, error, context);
  } else {
    logger.error('Unknown error occurred', undefined, context, { error });
  }

  // AppError (custom application errors)
  if (error instanceof AppError) {
    return errorResponse(error.code, error.message, error.status, error.details);
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Validation failed',
      400,
      {
        errors: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      }
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return errorResponse(
          ErrorCodes.DUPLICATE_ENTRY,
          'A record with this value already exists',
          409,
          { field: error.meta?.target }
        );
      case 'P2025':
        return errorResponse(
          ErrorCodes.RESOURCE_NOT_FOUND,
          'Resource not found',
          404
        );
      default:
        return errorResponse(
          ErrorCodes.DATABASE_ERROR,
          'Database operation failed',
          500,
          { code: error.code }
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid data provided',
      400
    );
  }

  // Generic errors
  if (error instanceof Error) {
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message,
      500
    );
  }

  // Unknown errors
  return errorResponse(
    ErrorCodes.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred',
    500
  );
}
