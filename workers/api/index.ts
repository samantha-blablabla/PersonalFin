/**
 * FinTrack Pro VN - Cloudflare Worker Entry Point
 * Main API handler for all requests
 */

import { handleCors, corsHeaders } from './middleware/cors';
import { handleError, errorResponse } from './middleware/errorHandler';
import { matchRoute, extractParams } from './routes';

export interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
  TELEGRAM_BOT_TOKEN?: string;
  ALLOWED_ORIGINS?: string;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Handle CORS preflight
      const corsResponse = handleCors(request, env);
      if (corsResponse) {
        return corsResponse;
      }

      // Parse URL
      const url = new URL(request.url);
      const pathname = url.pathname;
      const method = request.method;

      // Match route
      const route = matchRoute(pathname, method);
      if (!route) {
        return errorResponse('Not Found', 404);
      }

      // Extract params
      const params = extractParams(pathname, route.pattern);

      // Call handler
      const response = await route.handler(request, env, params);

      // Add CORS headers to response
      const origin = request.headers.get('Origin') || '';
      const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
      const corsHeadersObj = corsHeaders(origin, allowedOrigins);

      // Clone response and add CORS headers
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeadersObj).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (error) {
      return handleError(error);
    }
  },
};
