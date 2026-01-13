/**
 * Shark Tracker Service
 * Phát hiện và phân tích "dấu chân cá mập" qua VSA
 */

import type { PriceData, SharkSignal, MarketAction } from '../../types';
import { SHARK_SIGNAL_ICONS } from '../core/configService';
import {
  analyzeVolumeSpread,
  calculatePriceChange,
  detectBigMoneyIn,
  detectDistribution,
  detectLowSupply,
  detectPumpAndDump,
} from './volumeAnalysisService';

export interface SharkAnalysisResult {
  success: boolean;
  data?: SharkSignal;
  error?: string;
}

/**
 * Phân loại trạng thái thị trường dựa trên VSA
 */
export function classifyMarketStatus(
  priceChange: number,
  volumeRatio: number,
  currentPrice: PriceData,
  avgVolume: number
): MarketAction {
  // Check Pump & Dump first (highest priority warning)
  if (detectPumpAndDump(priceChange, volumeRatio)) {
    return 'PUMPING'; // Will show warning in signal description
  }

  // Check Big Money In
  if (detectBigMoneyIn(priceChange, volumeRatio)) {
    return 'PUMPING';
  }

  // Check Distribution
  if (detectDistribution(priceChange, volumeRatio)) {
    return 'DISTRIBUTING';
  }

  // Check Low Supply (Accumulation)
  if (detectLowSupply(currentPrice, avgVolume)) {
    return 'ACCUMULATING';
  }

  // Default: Quiet market
  return 'QUIET';
}

/**
 * Generate signal description based on market action
 */
export function generateSignalDescription(
  status: MarketAction,
  priceChange: number,
  volumeRatio: number,
  isPumpDump: boolean
): string {
  switch (status) {
    case 'ACCUMULATING':
      return 'Cá mập đang âm thầm gom hàng. Giá đi ngang, khối lượng thấp. Vùng tích lũy tốt.';

    case 'PUMPING':
      if (isPumpDump) {
        return `🚨 CẢNH BÁO: Giá tăng ${priceChange.toFixed(1)}% KHÔNG kèm khối lượng tương ứng. Nguy cơ kéo xả cao!`;
      }
      return `Dòng tiền lớn đang nhập cuộc! Giá tăng ${priceChange.toFixed(1)}% với khối lượng gấp ${volumeRatio.toFixed(1)}x. Breakout mạnh.`;

    case 'DISTRIBUTING':
      return `Cá mập đang thoát hàng. Giá giảm ${Math.abs(priceChange).toFixed(1)}% với khối lượng đột biến ${volumeRatio.toFixed(1)}x. Cẩn thận!`;

    case 'QUIET':
    default:
      return 'Thị trường bình thường, không có tín hiệu đặc biệt.';
  }
}

/**
 * Generate icon cho shark signal
 */
export function generateSignalIcon(
  status: MarketAction,
  isPumpDump: boolean
): string {
  if (isPumpDump) {
    return SHARK_SIGNAL_ICONS.PUMP_DUMP; // 🚨
  }

  switch (status) {
    case 'ACCUMULATING':
      return SHARK_SIGNAL_ICONS.ANCHOR; // ⚓ (mỏ neo - tích lũy)

    case 'PUMPING':
      return SHARK_SIGNAL_ICONS.FIRE; // 🔥 (lửa - bùng nổ)

    case 'DISTRIBUTING':
      return SHARK_SIGNAL_ICONS.DISTRIBUTION; // ⚠️ (cảnh báo)

    case 'QUIET':
    default:
      return SHARK_SIGNAL_ICONS.SHARK; // 🦈 (cá mập - theo dõi)
  }
}

/**
 * Phân tích hành động cá mập cho một mã cổ phiếu
 */
export function analyzeSharkAction(
  currentPrice: PriceData,
  priceHistory: PriceData[],
  lookbackPeriod: number = 20
): SharkAnalysisResult {
  try {
    // Step 1: Analyze volume
    const volumeAnalysis = analyzeVolumeSpread(currentPrice, priceHistory, lookbackPeriod);

    if (!volumeAnalysis.success || !volumeAnalysis.data) {
      return {
        success: false,
        error: 'Volume analysis failed',
      };
    }

    const { avgVolume20d, currentVolume, volumeRatio } = volumeAnalysis.data;

    // Step 2: Calculate price change
    const priceChange = calculatePriceChange(currentPrice);

    // Step 3: Check for Pump & Dump
    const isPumpDump = detectPumpAndDump(priceChange, volumeRatio);

    // Step 4: Classify market status
    const status = classifyMarketStatus(priceChange, volumeRatio, currentPrice, avgVolume20d);

    // Step 5: Generate description and icon
    const signalDescription = generateSignalDescription(status, priceChange, volumeRatio, isPumpDump);
    const signalIcon = generateSignalIcon(status, isPumpDump);

    // Step 6: Create shark signal
    const sharkSignal: SharkSignal = {
      symbol: currentPrice.symbol,
      date: currentPrice.date,
      status,
      avgVolume20d,
      currentVolume,
      volumeRatio,
      priceChange,
      signalDescription,
      signalIcon,
    };

    return {
      success: true,
      data: sharkSignal,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Shark analysis failed',
    };
  }
}

/**
 * Batch analyze multiple symbols
 */
export function batchAnalyzeSharkAction(
  symbolsData: Map<string, { current: PriceData; history: PriceData[] }>,
  lookbackPeriod: number = 20
): SharkSignal[] {
  const signals: SharkSignal[] = [];

  for (const [symbol, data] of symbolsData.entries()) {
    const result = analyzeSharkAction(data.current, data.history, lookbackPeriod);

    if (result.success && result.data) {
      signals.push(result.data);
    }
  }

  // Sort by volume ratio (highest first)
  return signals.sort((a, b) => b.volumeRatio - a.volumeRatio);
}

/**
 * Filter signals by status
 */
export function filterSignalsByStatus(
  signals: SharkSignal[],
  statuses: MarketAction[]
): SharkSignal[] {
  return signals.filter((signal) => statuses.includes(signal.status));
}

/**
 * Get top N signals by volume ratio
 */
export function getTopSignals(
  signals: SharkSignal[],
  limit: number = 10
): SharkSignal[] {
  return signals
    .sort((a, b) => b.volumeRatio - a.volumeRatio)
    .slice(0, limit);
}

/**
 * Detect consecutive days of specific action (for advanced analysis)
 */
export function detectConsecutiveAction(
  signalHistory: SharkSignal[],
  targetStatus: MarketAction,
  minDays: number = 3
): boolean {
  if (signalHistory.length < minDays) return false;

  // Check if the last N days all have the target status
  const recentSignals = signalHistory.slice(0, minDays);
  return recentSignals.every((signal) => signal.status === targetStatus);
}
