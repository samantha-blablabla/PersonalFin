/**
 * API Routes Configuration
 * Maps URL patterns to handlers
 */

import { errorResponse, successResponse } from './middleware/errorHandler';
import * as sharkTracker from '../handlers/sharkTracker';
import * as investments from '../handlers/investments';

export interface Route {
  pattern: RegExp;
  handler: (request: Request, env: any, params: Record<string, string>) => Promise<Response>;
  method?: string;
}

export const routes: Route[] = [
  // Health check
  {
    pattern: /^\/$/,
    handler: async () => {
      return successResponse({
        message: 'FinTrack Pro VN API',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          investments: '/api/investments',
          sharkTracker: '/api/shark-tracker/*',
        },
      });
    },
  },

  // Health endpoint
  {
    pattern: /^\/health$/,
    handler: async () => {
      return successResponse({ status: 'healthy' });
    },
  },

  // ============================================================================
  // INVESTMENTS ENDPOINTS
  // ============================================================================

  {
    pattern: /^\/api\/investments$/,
    method: 'GET',
    handler: investments.getInvestments,
  },

  {
    pattern: /^\/api\/investments$/,
    method: 'POST',
    handler: investments.createInvestment,
  },

  {
    pattern: /^\/api\/investments\/profit-check$/,
    method: 'GET',
    handler: investments.profitCheck,
  },

  // ============================================================================
  // SHARK TRACKER ENDPOINTS
  // ============================================================================

  {
    pattern: /^\/api\/shark-tracker\/signals$/,
    method: 'GET',
    handler: sharkTracker.getSharkSignals,
  },

  {
    pattern: /^\/api\/shark-tracker\/analyze\/(?<symbol>[A-Z]{3})$/,
    method: 'GET',
    handler: sharkTracker.analyzeSymbol,
  },

  {
    pattern: /^\/api\/shark-tracker\/batch-analyze$/,
    method: 'POST',
    handler: sharkTracker.batchAnalyze,
  },

  {
    pattern: /^\/api\/shark-tracker\/dashboard$/,
    method: 'GET',
    handler: sharkTracker.getDashboard,
  },
];

export function matchRoute(pathname: string, method: string): Route | null {
  for (const route of routes) {
    if (route.pattern.test(pathname)) {
      // If route specifies method, check it matches
      if (route.method && route.method !== method) {
        continue;
      }
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
