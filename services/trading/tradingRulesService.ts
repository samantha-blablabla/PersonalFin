/**
 * Trading Rules Service
 * Logic kiểm tra chốt lời, scaling out, portfolio management
 */

import type { Investment, TradingRules } from '../../types';
import { DEFAULT_TRADING_RULES } from '../core/configService';

export interface ProfitCheckResult {
  shouldTakeProfit: boolean;
  profitPercentage: number;
  currentValue: number;
  investedValue: number;
  profitAmount: number;
}

export interface ScalingOutResult {
  quantityToSell: number;
  quantityToKeep: number;
  estimatedProceeds: number;
  remainingValue: number;
}

/**
 * Calculate profit percentage for an investment
 */
export function calculateProfitPercentage(investment: Investment): number {
  if (investment.avgPrice === 0) return 0;

  const profit = ((investment.currentPrice - investment.avgPrice) / investment.avgPrice) * 100;
  return Number(profit.toFixed(2));
}

/**
 * Check if investment reached profit threshold
 */
export function checkProfitThreshold(
  investment: Investment,
  rules: TradingRules = DEFAULT_TRADING_RULES
): ProfitCheckResult {
  const profitPercentage = calculateProfitPercentage(investment);
  const investedValue = investment.avgPrice * investment.quantity;
  const currentValue = investment.currentPrice * investment.quantity;
  const profitAmount = currentValue - investedValue;

  const shouldTakeProfit = profitPercentage >= rules.takeProfitThreshold * 100;

  return {
    shouldTakeProfit,
    profitPercentage,
    currentValue,
    investedValue,
    profitAmount,
  };
}

/**
 * Calculate scaling out (chốt lời từng phần)
 */
export function calculateScalingOut(
  investment: Investment,
  percentage: number = DEFAULT_TRADING_RULES.scalingOutRate
): ScalingOutResult {
  const quantityToSell = Math.floor(investment.quantity * percentage);
  const quantityToKeep = investment.quantity - quantityToSell;
  const estimatedProceeds = quantityToSell * investment.currentPrice;
  const remainingValue = quantityToKeep * investment.currentPrice;

  return {
    quantityToSell,
    quantityToKeep,
    estimatedProceeds,
    remainingValue,
  };
}

/**
 * Get profit taking recommendation
 */
export function getProfitRecommendation(
  investment: Investment,
  rules: TradingRules = DEFAULT_TRADING_RULES
): string {
  const profitCheck = checkProfitThreshold(investment, rules);

  if (!profitCheck.shouldTakeProfit) {
    return `Chưa đạt ngưỡng chốt lời (${profitCheck.profitPercentage.toFixed(1)}% < ${(rules.takeProfitThreshold * 100).toFixed(0)}%). Giữ tiếp.`;
  }

  const scalingOut = calculateScalingOut(investment, rules.scalingOutRate);

  return `
✅ ĐÃ ĐẠT MỤC TIÊU LỢI NHUẬN: ${profitCheck.profitPercentage.toFixed(1)}%

Đề xuất chiến lược:
- Chốt lời ${(rules.scalingOutRate * 100).toFixed(0)}%: Bán ${scalingOut.quantityToSell.toLocaleString()} cổ phiếu
- Thu về: ${scalingOut.estimatedProceeds.toLocaleString()} VNĐ
- Giữ lại: ${scalingOut.quantityToKeep.toLocaleString()} cổ phiếu
- Giá trị còn lại: ${scalingOut.remainingValue.toLocaleString()} VNĐ

Lợi ích: Chốt lời thực, giảm rủi ro, vẫn có cơ hội tăng thêm.
  `.trim();
}

/**
 * Calculate total portfolio value
 */
export function calculatePortfolioValue(investments: Investment[]): number {
  return investments.reduce((total, inv) => {
    return total + inv.currentPrice * inv.quantity;
  }, 0);
}

/**
 * Calculate portfolio profit/loss
 */
export function calculatePortfolioProfitLoss(investments: Investment[]): {
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
} {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.avgPrice * inv.quantity, 0);
  const currentValue = calculatePortfolioValue(investments);
  const profitLoss = currentValue - totalInvested;
  const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    profitLoss,
    profitLossPercentage: Number(profitLossPercentage.toFixed(2)),
  };
}

/**
 * Get investments that should take profit
 */
export function getInvestmentsToTakeProfit(
  investments: Investment[],
  rules: TradingRules = DEFAULT_TRADING_RULES
): Investment[] {
  return investments.filter((inv) => {
    const check = checkProfitThreshold(inv, rules);
    return check.shouldTakeProfit;
  });
}

/**
 * Calculate stop loss level (optional - for risk management)
 */
export function calculateStopLoss(
  avgPrice: number,
  stopLossPercentage: number = 0.1 // 10% default
): number {
  return avgPrice * (1 - stopLossPercentage);
}

/**
 * Check if investment hit stop loss
 */
export function checkStopLoss(
  investment: Investment,
  stopLossPercentage: number = 0.1
): boolean {
  const stopLossPrice = calculateStopLoss(investment.avgPrice, stopLossPercentage);
  return investment.currentPrice <= stopLossPrice;
}
