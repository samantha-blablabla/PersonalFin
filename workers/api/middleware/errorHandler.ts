/**
 * Error Handler Middleware
 * Standardized error responses
 */

export interface ApiError {
  success: false;
  error: string;
  details?: any;
  timestamp: string;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

export function successResponse<T>(data: T, status = 200): Response {
  const response: ApiSuccess<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function errorResponse(error: string, status = 500, details?: any): Response {
  const response: ApiError = {
    success: false,
    error,
    details,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function handleError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof Error) {
    return errorResponse(error.message, 500, {
      name: error.name,
      stack: error.stack,
    });
  }

  return errorResponse('Internal Server Error', 500);
}
