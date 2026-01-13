/**
 * API Routes Configuration
 * Maps URL patterns to handlers
 */

import { errorResponse, successResponse } from './middleware/errorHandler';
import * as sharkTracker from '../handlers/sharkTracker';
import * as investments from '../handlers/investments';
import * as transactions from '../handlers/transactions';
import * as goals from '../handlers/goals';
import * as watchlist from '../handlers/watchlist';

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
          transactions: '/api/transactions',
          goals: '/api/goals',
          watchlist: '/api/watchlist',
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

  // ============================================================================
  // TRANSACTIONS ENDPOINTS
  // ============================================================================

  {
    pattern: /^\/api\/transactions$/,
    method: 'GET',
    handler: transactions.getTransactions,
  },

  {
    pattern: /^\/api\/transactions$/,
    method: 'POST',
    handler: transactions.createTransaction,
  },

  {
    pattern: /^\/api\/transactions\/summary$/,
    method: 'GET',
    handler: transactions.getTransactionSummary,
  },

  {
    pattern: /^\/api\/transactions\/(?<id>[^\/]+)$/,
    method: 'DELETE',
    handler: transactions.deleteTransaction,
  },

  // ============================================================================
  // GOALS ENDPOINTS
  // ============================================================================

  {
    pattern: /^\/api\/goals$/,
    method: 'GET',
    handler: goals.getGoals,
  },

  {
    pattern: /^\/api\/goals$/,
    method: 'POST',
    handler: goals.createGoal,
  },

  {
    pattern: /^\/api\/goals\/summary$/,
    method: 'GET',
    handler: goals.getGoalsSummary,
  },

  {
    pattern: /^\/api\/goals\/(?<id>[^\/]+)$/,
    method: 'PUT',
    handler: goals.updateGoal,
  },

  {
    pattern: /^\/api\/goals\/(?<id>[^\/]+)$/,
    method: 'DELETE',
    handler: goals.deleteGoal,
  },

  // ============================================================================
  // WATCHLIST ENDPOINTS
  // ============================================================================

  {
    pattern: /^\/api\/watchlist$/,
    method: 'GET',
    handler: watchlist.getWatchlist,
  },

  {
    pattern: /^\/api\/watchlist$/,
    method: 'POST',
    handler: watchlist.addToWatchlist,
  },

  {
    pattern: /^\/api\/watchlist\/alerts$/,
    method: 'GET',
    handler: watchlist.getWatchlistAlerts,
  },

  {
    pattern: /^\/api\/watchlist\/(?<id>[^\/]+)$/,
    method: 'PUT',
    handler: watchlist.updateWatchlistItem,
  },

  {
    pattern: /^\/api\/watchlist\/(?<id>[^\/]+)$/,
    method: 'DELETE',
    handler: watchlist.removeFromWatchlist,
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
