/**
 * Rebalancing Service
 * Tái cơ cấu danh mục: Bán mã tăng cao, mua mã tiềm năng
 */

import type { Investment, RebalancingProposal } from '../../types';
import { generateId, getCurrentTimestamp } from '../core/configService';
import { calculateProfitPercentage } from './tradingRulesService';

/**
 * Simulate rebalancing (chuyển từ mã này sang mã khác)
 */
export function simulateRebalance(
  sellInvestment: Investment,
  sellPercentage: number,
  buySymbol: string,
  buyPrice: number
): RebalancingProposal {
  const proceeds = calculateProceedsFromSale(sellInvestment, sellPercentage);
  const buyQuantity = calculateBuyQuantity(proceeds.saleValue, buyPrice);

  return {
    id: generateId(),
    fromSymbol: sellInvestment.symbol,
    toSymbol: buySymbol,
    sellQuantity: proceeds.quantityToSell,
    sellValue: proceeds.saleValue,
    buyQuantity,
    reason: `Chốt lời ${calculateProfitPercentage(sellInvestment).toFixed(1)}% từ ${sellInvestment.symbol}, xoay vốn sang ${buySymbol}`,
    expectedGain: 0, // Will be calculated based on target price
    createdAt: getCurrentTimestamp(),
  };
}

/**
 * Calculate proceeds from selling
 */
export function calculateProceedsFromSale(
  investment: Investment,
  sellPercentage: number
): {
  quantityToSell: number;
  saleValue: number;
  remainingQuantity: number;
} {
  const quantityToSell = Math.floor(investment.quantity * sellPercentage);
  const saleValue = quantityToSell * investment.currentPrice;
  const remainingQuantity = investment.quantity - quantityToSell;

  return {
    quantityToSell,
    saleValue,
    remainingQuantity,
  };
}

/**
 * Calculate how many shares can be bought with cash
 */
export function calculateBuyQuantity(
  cashAmount: number,
  targetPrice: number
): number {
  if (targetPrice === 0) return 0;
  return Math.floor(cashAmount / targetPrice);
}

/**
 * Generate rebalancing proposal based on portfolio analysis
 */
export function generateRebalancingProposal(
  portfolio: Investment[],
  profitThreshold: number = 0.25
): RebalancingProposal[] {
  const proposals: RebalancingProposal[] = [];

  // Find investments with high profit
  const profitableInvestments = portfolio.filter((inv) => {
    const profitPct = calculateProfitPercentage(inv) / 100;
    return profitPct >= profitThreshold;
  });

  // Find investments at loss or sideways (potential targets)
  const buyTargets = portfolio.filter((inv) => {
    const profitPct = calculateProfitPercentage(inv) / 100;
    return profitPct < 0.1; // Less than 10% gain or at loss
  });

  // Generate proposals: Sell high, buy low
  for (const sellInv of profitableInvestments) {
    for (const buyInv of buyTargets) {
      if (sellInv.symbol === buyInv.symbol) continue;

      const proposal = simulateRebalance(
        sellInv,
        0.3, // Sell 30%
        buyInv.symbol,
        buyInv.currentPrice
      );

      proposals.push(proposal);
    }
  }

  return proposals;
}

/**
 * Calculate portfolio weight (tỷ trọng)
 */
export function calculatePortfolioWeight(
  investment: Investment,
  totalValue: number
): number {
  if (totalValue === 0) return 0;

  const investmentValue = investment.currentPrice * investment.quantity;
  return Number(((investmentValue / totalValue) * 100).toFixed(2));
}

/**
 * Check if portfolio is balanced
 */
export function isPortfolioBalanced(
  investments: Investment[],
  maxWeightPerStock: number = 30 // Max 30% per stock
): boolean {
  const totalValue = investments.reduce(
    (sum, inv) => sum + inv.currentPrice * inv.quantity,
    0
  );

  for (const inv of investments) {
    const weight = calculatePortfolioWeight(inv, totalValue);
    if (weight > maxWeightPerStock) {
      return false;
    }
  }

  return true;
}

/**
 * Get suggestions to balance portfolio
 */
export function getBalancingSuggestions(
  investments: Investment[],
  targetWeightPerStock: number = 20 // Target 20% per stock
): string[] {
  const suggestions: string[] = [];
  const totalValue = investments.reduce(
    (sum, inv) => sum + inv.currentPrice * inv.quantity,
    0
  );

  for (const inv of investments) {
    const weight = calculatePortfolioWeight(inv, totalValue);

    if (weight > targetWeightPerStock * 1.5) {
      // More than 150% of target
      suggestions.push(
        `⚠️ ${inv.symbol}: Tỷ trọng quá cao (${weight.toFixed(1)}%). Nên giảm xuống ~${targetWeightPerStock}%`
      );
    } else if (weight < targetWeightPerStock * 0.5) {
      // Less than 50% of target
      suggestions.push(
        `📈 ${inv.symbol}: Tỷ trọng thấp (${weight.toFixed(1)}%). Có thể tăng lên ~${targetWeightPerStock}%`
      );
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('✅ Danh mục cân bằng tốt!');
  }

  return suggestions;
}

/**
 * Calculate diversification score (0-100)
 */
export function calculateDiversificationScore(investments: Investment[]): number {
  if (investments.length === 0) return 0;
  if (investments.length === 1) return 20; // Low diversification

  const totalValue = investments.reduce(
    (sum, inv) => sum + inv.currentPrice * inv.quantity,
    0
  );

  // Calculate Herfindahl Index (lower is better)
  const herfindahl = investments.reduce((sum, inv) => {
    const weight = calculatePortfolioWeight(inv, totalValue) / 100;
    return sum + weight * weight;
  }, 0);

  // Convert to score (0-100, higher is better)
  const maxHerfindahl = 1; // All in one stock
  const minHerfindahl = 1 / investments.length; // Perfect balance

  const score = ((maxHerfindahl - herfindahl) / (maxHerfindahl - minHerfindahl)) * 100;

  return Math.max(0, Math.min(100, Number(score.toFixed(0))));
}
