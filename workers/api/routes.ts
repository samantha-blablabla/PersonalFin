/**
 * API Routes Configuration
 * Maps URL patterns to handlers
 */

import { errorResponse } from './middleware/errorHandler';

export interface Route {
  pattern: RegExp;
  handler: (request: Request, env: any, params: Record<string, string>) => Promise<Response>;
}

export const routes: Route[] = [
  // Health check
  {
    pattern: /^\/$/,
    handler: async () => {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'FinTrack Pro VN API',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    },
  },

  // Health endpoint
  {
    pattern: /^\/health$/,
    handler: async () => {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'healthy',
          timestamp: new Date().toISOString(),
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    },
  },

  // Transactions endpoints (placeholder)
  {
    pattern: /^\/api\/transactions$/,
    handler: async (request) => {
      if (request.method === 'GET') {
        return new Response(
          JSON.stringify({
            success: true,
            data: [],
            message: 'Transactions endpoint - Coming soon',
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
      return errorResponse('Method not allowed', 405);
    },
  },

  // Investments endpoints (placeholder)
  {
    pattern: /^\/api\/investments$/,
    handler: async (request) => {
      if (request.method === 'GET') {
        return new Response(
          JSON.stringify({
            success: true,
            data: [],
            message: 'Investments endpoint - Coming soon',
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
      return errorResponse('Method not allowed', 405);
    },
  },

  // Shark Tracker endpoints (placeholder)
  {
    pattern: /^\/api\/shark-tracker\/signals$/,
    handler: async () => {
      return new Response(
        JSON.stringify({
          success: true,
          data: [],
          message: 'Shark Tracker endpoint - Coming soon',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    },
  },
];

export function matchRoute(pathname: string): Route | null {
  for (const route of routes) {
    if (route.pattern.test(pathname)) {
      return route;
    }
  }
  return null;
}

export function extractParams(pathname: string, pattern: RegExp): Record<string, string> {
  const match = pathname.match(pattern);
  if (!match) return {};

  const params: Record<string, string> = {};
  // Extract named groups if available
  if (match.groups) {
    Object.assign(params, match.groups);
  }

  return params;
}
