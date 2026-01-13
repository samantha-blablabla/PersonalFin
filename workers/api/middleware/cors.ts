/**
 * CORS Middleware for Cloudflare Workers
 * Handles Cross-Origin Resource Sharing
 */

export interface Env {
  ALLOWED_ORIGINS?: string;
}

export function corsHeaders(origin: string, allowedOrigins: string[]): HeadersInit {
  const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*');

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCors(request: Request, env: Env): Response | null {
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin, allowedOrigins),
    });
  }

  return null;
}
