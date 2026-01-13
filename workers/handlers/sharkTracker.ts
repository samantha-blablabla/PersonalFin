/**
 * Shark Tracker API Handlers
 * Endpoints for VSA and shark signal analysis
 */

import { D1Service } from '../../services/core/d1Service';
import { analyzeSharkAction, batchAnalyzeSharkAction } from '../../services/trading/sharkTrackerService';
import { successResponse, errorResponse } from '../api/middleware/errorHandler';
import type { Env } from '../api/index';

/**
 * GET /api/shark-tracker/signals
 * Get recent shark signals
 */
export async function getSharkSignals(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7');

    const d1Service = new D1Service(env.DB);
    const result = await d1Service.getSharkSignals(days);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to fetch signals', 500);
    }

    return successResponse(result.data || []);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * GET /api/shark-tracker/analyze/:symbol
 * Analyze a single stock for shark signals
 */
export async function analyzeSymbol(
  request: Request,
  env: Env,
  params: { symbol: string }
): Promise<Response> {
  try {
    const { symbol } = params;

    if (!symbol || symbol.length !== 3) {
      return errorResponse('Invalid symbol format (must be 3 characters)', 400);
    }

    const d1Service = new D1Service(env.DB);

    // Get latest price
    const latestPriceResult = await d1Service.getLatestPrice(symbol.toUpperCase());
    if (!latestPriceResult.success || !latestPriceResult.data) {
      return errorResponse('No price data found for this symbol', 404);
    }

    // Get price history (20 days for analysis)
    const historyResult = await d1Service.getPriceHistory(symbol.toUpperCase(), 21);
    if (!historyResult.success || !historyResult.data || historyResult.data.length < 20) {
      return errorResponse('Insufficient price history for analysis', 400);
    }

    // Analyze shark action
    const currentPrice = latestPriceResult.data;
    const priceHistory = historyResult.data.slice(1); // Exclude current price

    const analysisResult = analyzeSharkAction(currentPrice, priceHistory, 20);

    if (!analysisResult.success || !analysisResult.data) {
      return errorResponse(analysisResult.error || 'Analysis failed', 500);
    }

    // Save signal to database
    await d1Service.saveSharkSignal(analysisResult.data);

    return successResponse(analysisResult.data);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * POST /api/shark-tracker/batch-analyze
 * Analyze multiple stocks
 * Body: { symbols: string[] }
 */
export async function batchAnalyze(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const { symbols } = body;

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return errorResponse('Symbols array is required', 400);
    }

    const d1Service = new D1Service(env.DB);
    const symbolsData = new Map();

    // Fetch data for all symbols
    for (const symbol of symbols) {
      const upperSymbol = symbol.toUpperCase();

      const latestResult = await d1Service.getLatestPrice(upperSymbol);
      const historyResult = await d1Service.getPriceHistory(upperSymbol, 21);

      if (
        latestResult.success &&
        latestResult.data &&
        historyResult.success &&
        historyResult.data &&
        historyResult.data.length >= 20
      ) {
        symbolsData.set(upperSymbol, {
          current: latestResult.data,
          history: historyResult.data.slice(1),
        });
      }
    }

    // Batch analyze
    const signals = batchAnalyzeSharkAction(symbolsData, 20);

    // Save all signals
    for (const signal of signals) {
      await d1Service.saveSharkSignal(signal);
    }

    return successResponse({
      analyzed: signals.length,
      signals,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * GET /api/shark-tracker/dashboard
 * Get dashboard data with top signals
 */
export async function getDashboard(request: Request, env: Env): Promise<Response> {
  try {
    const d1Service = new D1Service(env.DB);

    // Get recent signals (last 7 days)
    const signalsResult = await d1Service.getSharkSignals(7);

    if (!signalsResult.success) {
      return errorResponse('Failed to fetch signals', 500);
    }

    const signals = signalsResult.data || [];

    // Group by status
    const dashboard = {
      totalSignals: signals.length,
      byStatus: {
        ACCUMULATING: signals.filter((s) => s.status === 'ACCUMULATING').length,
        PUMPING: signals.filter((s) => s.status === 'PUMPING').length,
        DISTRIBUTING: signals.filter((s) => s.status === 'DISTRIBUTING').length,
        QUIET: signals.filter((s) => s.status === 'QUIET').length,
      },
      topSignals: signals
        .sort((a, b) => b.volumeRatio - a.volumeRatio)
        .slice(0, 10),
      recentSignals: signals.slice(0, 20),
    };

    return successResponse(dashboard);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
