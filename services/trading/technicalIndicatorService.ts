/**
 * Technical Indicator Service
 * Tính toán các chỉ báo kỹ thuật: RSI, MA, etc.
 */

import type { PriceData, TechnicalIndicator } from '../../types';
import { DEFAULT_TRADING_RULES } from '../core/configService';

/**
 * Calculate RSI (Relative Strength Index)
 * RSI = 100 - (100 / (1 + RS))
 * RS = Average Gain / Average Loss
 */
export function calculateRSI(
  priceHistory: PriceData[],
  period: number = 14
): number | null {
  if (priceHistory.length < period + 1) {
    return null; // Not enough data
  }

  const changes: number[] = [];

  // Calculate price changes
  for (let i = 0; i < priceHistory.length - 1; i++) {
    const change = priceHistory[i].closePrice - priceHistory[i + 1].closePrice;
    changes.push(change);
  }

  if (changes.length < period) {
    return null;
  }

  // Calculate initial average gain and loss
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // Smoothed RS calculation
  for (let i = period; i < changes.length; i++) {
    if (changes[i] > 0) {
      avgGain = (avgGain * (period - 1) + changes[i]) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(changes[i])) / period;
    }
  }

  // Avoid division by zero
  if (avgLoss === 0) {
    return 100;
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return Number(rsi.toFixed(2));
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateMA(
  priceHistory: PriceData[],
  period: number
): number | null {
  if (priceHistory.length < period) {
    return null;
  }

  const relevantPrices = priceHistory.slice(0, period);
  const sum = relevantPrices.reduce((acc, price) => acc + price.closePrice, 0);

  return Number((sum / period).toFixed(2));
}

/**
 * Detect overbought condition (RSI > threshold)
 */
export function detectOverbought(
  rsi: number,
  threshold: number = DEFAULT_TRADING_RULES.rsiOverbought
): boolean {
  return rsi > threshold;
}

/**
 * Detect oversold condition (RSI < threshold)
 */
export function detectOversold(
  rsi: number,
  threshold: number = DEFAULT_TRADING_RULES.rsiOversold
): boolean {
  return rsi < threshold;
}

/**
 * Calculate price change rate over periods
 */
export function getPriceChangeRate(
  currentPrice: number,
  oldPrice: number
): number {
  if (oldPrice === 0) return 0;

  const change = ((currentPrice - oldPrice) / oldPrice) * 100;
  return Number(change.toFixed(2));
}

/**
 * Generate technical indicator data for a symbol
 */
export function generateTechnicalIndicator(
  symbol: string,
  priceHistory: PriceData[]
): TechnicalIndicator | null {
  if (priceHistory.length === 0) {
    return null;
  }

  const currentPrice = priceHistory[0];

  // Calculate RSI
  const rsi = calculateRSI(priceHistory, 14);

  // Calculate MAs
  const ma20 = calculateMA(priceHistory, 20);
  const ma50 = calculateMA(priceHistory, 50);

  // Calculate volume average
  const volumeAvg = priceHistory.length >= 20
    ? priceHistory.slice(0, 20).reduce((sum, p) => sum + p.volume, 0) / 20
    : null;

  // Calculate price change (today vs yesterday)
  const priceChange = priceHistory.length >= 2
    ? getPriceChangeRate(
        priceHistory[0].closePrice,
        priceHistory[1].closePrice
      )
    : null;

  return {
    symbol,
    date: currentPrice.date,
    rsi: rsi ?? undefined,
    ma20: ma20 ?? undefined,
    ma50: ma50 ?? undefined,
    volumeAvg: volumeAvg ? Math.round(volumeAvg) : undefined,
    priceChange: priceChange ?? undefined,
  };
}

/**
 * Batch calculate indicators for multiple symbols
 */
export function batchGenerateTechnicalIndicators(
  symbolsData: Map<string, PriceData[]>
): TechnicalIndicator[] {
  const indicators: TechnicalIndicator[] = [];

  for (const [symbol, priceHistory] of symbolsData.entries()) {
    const indicator = generateTechnicalIndicator(symbol, priceHistory);
    if (indicator) {
      indicators.push(indicator);
    }
  }

  return indicators;
}

/**
 * Get RSI signal (BUY/SELL/HOLD)
 */
export function getRSISignal(rsi: number): 'BUY' | 'SELL' | 'HOLD' {
  if (detectOversold(rsi)) {
    return 'BUY'; // Oversold - good time to buy
  }

  if (detectOverbought(rsi)) {
    return 'SELL'; // Overbought - consider selling
  }

  return 'HOLD';
}

/**
 * Check if price is above/below MA (trend confirmation)
 */
export function isPriceAboveMA(
  currentPrice: number,
  ma: number
): boolean {
  return currentPrice > ma;
}

/**
 * Detect Golden Cross (MA20 crosses above MA50 - bullish)
 */
export function detectGoldenCross(
  priceHistory: PriceData[]
): boolean {
  if (priceHistory.length < 51) return false;

  const currentMA20 = calculateMA(priceHistory, 20);
  const currentMA50 = calculateMA(priceHistory, 50);

  const previousMA20 = calculateMA(priceHistory.slice(1), 20);
  const previousMA50 = calculateMA(priceHistory.slice(1), 50);

  if (!currentMA20 || !currentMA50 || !previousMA20 || !previousMA50) {
    return false;
  }

  // Golden Cross: MA20 crosses above MA50
  return previousMA20 <= previousMA50 && currentMA20 > currentMA50;
}

/**
 * Detect Death Cross (MA20 crosses below MA50 - bearish)
 */
export function detectDeathCross(
  priceHistory: PriceData[]
): boolean {
  if (priceHistory.length < 51) return false;

  const currentMA20 = calculateMA(priceHistory, 20);
  const currentMA50 = calculateMA(priceHistory, 50);

  const previousMA20 = calculateMA(priceHistory.slice(1), 20);
  const previousMA50 = calculateMA(priceHistory.slice(1), 50);

  if (!currentMA20 || !currentMA50 || !previousMA20 || !previousMA50) {
    return false;
  }

  // Death Cross: MA20 crosses below MA50
  return previousMA20 >= previousMA50 && currentMA20 < currentMA50;
}
