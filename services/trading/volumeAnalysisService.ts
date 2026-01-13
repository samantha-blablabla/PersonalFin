/**
 * Volume Analysis Service (VSA - Volume Spread Analysis)
 * Phân tích khối lượng giao dịch để phát hiện "dấu chân cá mập"
 */

import type { PriceData, VolumeProfile } from '../../types';
import { VSA_RULES } from '../core/configService';

export interface VolumeAnalysisResult {
  success: boolean;
  data?: VolumeProfile;
  error?: string;
}

/**
 * Tính khối lượng trung bình trong N phiên
 */
export function calculateAverageVolume(
  priceHistory: PriceData[],
  lookbackPeriod: number = 20
): number {
  if (priceHistory.length === 0) return 0;

  const relevantData = priceHistory.slice(0, lookbackPeriod);
  const totalVolume = relevantData.reduce((sum, data) => sum + data.volume, 0);

  return totalVolume / relevantData.length;
}

/**
 * Phát hiện đột biến khối lượng
 */
export function detectVolumeSurge(
  currentVolume: number,
  avgVolume: number,
  threshold: number = VSA_RULES.BIG_MONEY_VOLUME_THRESHOLD
): boolean {
  if (avgVolume === 0) return false;

  const ratio = currentVolume / avgVolume;
  return ratio >= threshold;
}

/**
 * Tính tỷ lệ volume so với trung bình
 */
export function calculateVolumeRatio(currentVolume: number, avgVolume: number): number {
  if (avgVolume === 0) return 0;
  return currentVolume / avgVolume;
}

/**
 * Phân tích volume spread cho một ngày cụ thể
 */
export function analyzeVolumeSpread(
  currentPrice: PriceData,
  priceHistory: PriceData[],
  lookbackPeriod: number = 20
): VolumeAnalysisResult {
  try {
    // Tính average volume 20 phiên
    const avgVolume = calculateAverageVolume(priceHistory, lookbackPeriod);

    // Tính volume ratio
    const volumeRatio = calculateVolumeRatio(currentPrice.volume, avgVolume);

    // Check volume surge
    const volumeSurge = detectVolumeSurge(currentPrice.volume, avgVolume);

    const profile: VolumeProfile = {
      symbol: currentPrice.symbol,
      date: currentPrice.date,
      avgVolume20d: Math.round(avgVolume),
      currentVolume: currentPrice.volume,
      volumeRatio: Number(volumeRatio.toFixed(2)),
      volumeSurge,
    };

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Volume analysis failed',
    };
  }
}

/**
 * Tính % thay đổi giá
 */
export function calculatePriceChange(currentPrice: PriceData): number {
  if (currentPrice.openPrice === 0) return 0;

  const change = ((currentPrice.closePrice - currentPrice.openPrice) / currentPrice.openPrice) * 100;
  return Number(change.toFixed(2));
}

/**
 * Lấy volume profile cho nhiều ngày
 */
export function getVolumeProfile(
  priceHistory: PriceData[],
  days: number = 7,
  lookbackPeriod: number = 20
): VolumeProfile[] {
  const profiles: VolumeProfile[] = [];

  // Cần có ít nhất lookbackPeriod + 1 phiên để tính toán
  if (priceHistory.length < lookbackPeriod + 1) {
    return profiles;
  }

  // Phân tích từng ngày trong khoảng thời gian yêu cầu
  for (let i = 0; i < Math.min(days, priceHistory.length - lookbackPeriod); i++) {
    const currentPrice = priceHistory[i];
    const historicalData = priceHistory.slice(i + 1, i + lookbackPeriod + 1);

    const result = analyzeVolumeSpread(currentPrice, historicalData, lookbackPeriod);

    if (result.success && result.data) {
      profiles.push(result.data);
    }
  }

  return profiles;
}

/**
 * Check if price is moving sideways (đi ngang)
 */
export function isPriceSideways(currentPrice: PriceData): boolean {
  if (currentPrice.openPrice === 0) return false;

  const priceChangePercent = Math.abs(calculatePriceChange(currentPrice)) / 100;
  return priceChangePercent <= VSA_RULES.LOW_SUPPLY_PRICE_RANGE;
}

/**
 * Check if volume is low (thấp hơn trung bình)
 */
export function isLowVolume(
  currentVolume: number,
  avgVolume: number,
  threshold: number = VSA_RULES.LOW_SUPPLY_VOLUME_THRESHOLD
): boolean {
  if (avgVolume === 0) return false;

  const ratio = currentVolume / avgVolume;
  return ratio <= threshold;
}

/**
 * Detect "Low Supply" condition (cạn cung)
 * Giá đi ngang + khối lượng thấp = Cá mập đang gom hàng
 */
export function detectLowSupply(
  currentPrice: PriceData,
  avgVolume: number
): boolean {
  const sideways = isPriceSideways(currentPrice);
  const lowVol = isLowVolume(currentPrice.volume, avgVolume);

  return sideways && lowVol;
}

/**
 * Detect "Big Money In" (dòng tiền lớn)
 * Giá tăng mạnh + khối lượng lớn = Cá mập đang mua mạnh
 */
export function detectBigMoneyIn(
  priceChange: number,
  volumeRatio: number
): boolean {
  const strongPriceIncrease = priceChange > VSA_RULES.BIG_MONEY_PRICE_THRESHOLD * 100;
  const highVolume = volumeRatio >= VSA_RULES.BIG_MONEY_VOLUME_THRESHOLD;

  return strongPriceIncrease && highVolume;
}

/**
 * Detect "Distribution" (phân phối/xả hàng)
 * Giá giảm + khối lượng đột biến = Cá mập đang bán
 */
export function detectDistribution(
  priceChange: number,
  volumeRatio: number
): boolean {
  const priceDecrease = priceChange < 0;
  const volumeSurge = volumeRatio >= VSA_RULES.DISTRIBUTION_VOLUME_THRESHOLD;

  return priceDecrease && volumeSurge;
}

/**
 * Detect "Pump & Dump" warning (kéo xả)
 * Giá tăng mạnh NHƯNG khối lượng không theo kịp = Nguy hiểm
 */
export function detectPumpAndDump(
  priceChange: number,
  volumeRatio: number
): boolean {
  const strongPriceIncrease = priceChange > VSA_RULES.PUMP_DUMP_PRICE_THRESHOLD * 100;
  const weakVolume = volumeRatio < VSA_RULES.PUMP_DUMP_VOLUME_THRESHOLD;

  return strongPriceIncrease && weakVolume;
}
