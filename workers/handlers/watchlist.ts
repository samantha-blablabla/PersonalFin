/**
 * Watchlist API Handlers
 */

import { D1Service } from '../../services/core/d1Service';
import { successResponse, errorResponse } from '../api/middleware/errorHandler';
import type { Env } from '../api/index';
import type { WatchlistItem } from '../../types';

/**
 * GET /api/watchlist
 * Get all watchlist items with current prices
 */
export async function getWatchlist(request: Request, env: Env): Promise<Response> {
  try {
    const d1Service = new D1Service(env.DB);
    const result = await d1Service.getWatchlist();

    if (!result.success) {
      return errorResponse(result.error || 'Failed to fetch watchlist', 500);
    }

    const watchlist = result.data || [];

    // Enrich with current price data
    const enrichedWatchlist = await Promise.all(
      watchlist.map(async (item) => {
        const priceResult = await d1Service.getLatestPrice(item.symbol);
        const currentPrice = priceResult.success && priceResult.data ? priceResult.data.closePrice : 0;

        const targetDifference =
          item.targetPrice && currentPrice > 0 ? ((item.targetPrice - currentPrice) / currentPrice) * 100 : 0;

        return {
          ...item,
          currentPrice,
          targetDifference: Number(targetDifference.toFixed(2)),
          isPriceAlert:
            (item.targetPrice && currentPrice >= item.targetPrice) ||
            (item.stopLoss && currentPrice <= item.stopLoss),
        };
      })
    );

    return successResponse(enrichedWatchlist);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * POST /api/watchlist
 * Add symbol to watchlist
 */
export async function addToWatchlist(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const { symbol, targetPrice, stopLoss, notes } = body;

    // Validate symbol
    if (!symbol || !/^[A-Z]{3}$/.test(symbol)) {
      return errorResponse('Invalid symbol format (must be 3 uppercase letters)', 400);
    }

    // Validate prices if provided
    if (targetPrice && (typeof targetPrice !== 'number' || targetPrice <= 0)) {
      return errorResponse('Invalid target price', 400);
    }

    if (stopLoss && (typeof stopLoss !== 'number' || stopLoss <= 0)) {
      return errorResponse('Invalid stop loss', 400);
    }

    const watchlistItem: WatchlistItem = {
      symbol: symbol.toUpperCase(),
      targetPrice: targetPrice || undefined,
      stopLoss: stopLoss || undefined,
      notes: notes || undefined,
    };

    const d1Service = new D1Service(env.DB);
    const result = await d1Service.addToWatchlist(watchlistItem);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to add to watchlist', 500);
    }

    return successResponse(result.data, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * PUT /api/watchlist/:id
 * Update watchlist item
 */
export async function updateWatchlistItem(
  request: Request,
  env: Env,
  params: { id: string }
): Promise<Response> {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return errorResponse('Watchlist item ID is required', 400);
    }

    const { targetPrice, stopLoss, notes } = body;

    const d1Service = new D1Service(env.DB);

    // Get existing item
    const existingResult = await d1Service.getWatchlist();
    if (!existingResult.success || !existingResult.data) {
      return errorResponse('Failed to fetch watchlist', 500);
    }

    const existingItem = existingResult.data.find((w) => w.id === id);
    if (!existingItem) {
      return errorResponse('Watchlist item not found', 404);
    }

    // Update item
    const updatedItem: WatchlistItem = {
      ...existingItem,
      targetPrice: targetPrice !== undefined ? targetPrice : existingItem.targetPrice,
      stopLoss: stopLoss !== undefined ? stopLoss : existingItem.stopLoss,
      notes: notes !== undefined ? notes : existingItem.notes,
    };

    const result = await d1Service.updateWatchlistItem(id, updatedItem);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to update watchlist item', 500);
    }

    return successResponse(result.data);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * DELETE /api/watchlist/:id
 * Remove symbol from watchlist
 */
export async function removeFromWatchlist(
  request: Request,
  env: Env,
  params: { id: string }
): Promise<Response> {
  try {
    const { id } = params;

    if (!id) {
      return errorResponse('Watchlist item ID is required', 400);
    }

    const d1Service = new D1Service(env.DB);
    const result = await d1Service.removeFromWatchlist(id);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to remove from watchlist', 500);
    }

    return successResponse({ message: 'Removed from watchlist successfully' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * GET /api/watchlist/alerts
 * Get watchlist items that triggered price alerts
 */
export async function getWatchlistAlerts(request: Request, env: Env): Promise<Response> {
  try {
    const d1Service = new D1Service(env.DB);
    const result = await d1Service.getWatchlist();

    if (!result.success || !result.data) {
      return errorResponse('Failed to fetch watchlist', 500);
    }

    const watchlist = result.data;
    const alerts: Array<{
      item: WatchlistItem;
      currentPrice: number;
      alertType: 'TARGET_REACHED' | 'STOP_LOSS_HIT';
      alertMessage: string;
    }> = [];

    for (const item of watchlist) {
      const priceResult = await d1Service.getLatestPrice(item.symbol);
      if (!priceResult.success || !priceResult.data) continue;

      const currentPrice = priceResult.data.closePrice;

      // Check target price
      if (item.targetPrice && currentPrice >= item.targetPrice) {
        alerts.push({
          item,
          currentPrice,
          alertType: 'TARGET_REACHED',
          alertMessage: `${item.symbol} đã đạt mục tiêu ${item.targetPrice.toLocaleString()} VND (hiện tại: ${currentPrice.toLocaleString()} VND)`,
        });
      }

      // Check stop loss
      if (item.stopLoss && currentPrice <= item.stopLoss) {
        alerts.push({
          item,
          currentPrice,
          alertType: 'STOP_LOSS_HIT',
          alertMessage: `${item.symbol} đã chạm stop loss ${item.stopLoss.toLocaleString()} VND (hiện tại: ${currentPrice.toLocaleString()} VND)`,
        });
      }
    }

    return successResponse({
      totalAlerts: alerts.length,
      alerts,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
