/**
 * Standard API Response Format
 * Consistent response structure across all endpoints
 */

import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: ApiSuccessResponse['meta'] | null,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      meta: meta ?? undefined,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Error response helper
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // 400 Bad Request
  INVALID_INPUT: 'INVALID_INPUT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // 401 Unauthorized
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // 403 Forbidden
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // 404 Not Found
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  TRAIN_NOT_FOUND: 'TRAIN_NOT_FOUND',
  STATION_NOT_FOUND: 'STATION_NOT_FOUND',
  TRAIN_TYPE_NOT_FOUND: 'TRAIN_TYPE_NOT_FOUND',
  TRAIN_STOP_NOT_FOUND: 'TRAIN_STOP_NOT_FOUND',
  BOGIE_NOT_FOUND: 'BOGIE_NOT_FOUND',
  COMPOSITION_NOT_FOUND: 'COMPOSITION_NOT_FOUND',
  TRAIN_FARE_NOT_FOUND: 'TRAIN_FARE_NOT_FOUND',
  AC_FARE_NOT_FOUND: 'AC_FARE_NOT_FOUND',
  BERTH_FARE_NOT_FOUND: 'BERTH_FARE_NOT_FOUND',
  DISTANCE_FARE_NOT_FOUND: 'DISTANCE_FARE_NOT_FOUND',
  
  // 409 Conflict
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  CANNOT_DELETE: 'CANNOT_DELETE',
  
  // 429 Too Many Requests
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // 500 Internal Server Error
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  PRICING_CALCULATION_ERROR: 'PRICING_CALCULATION_ERROR',
} as const;
