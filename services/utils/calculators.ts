/**
 * Financial Calculators
 * Các hàm tính toán tài chính
 */

import type { Investment, Transaction } from '../../types';

/**
 * Calculate ROI (Return on Investment)
 */
export function calculateROI(investment: Investment): number {
  if (investment.avgPrice === 0) return 0;

  const roi = ((investment.currentPrice - investment.avgPrice) / investment.avgPrice) * 100;
  return Number(roi.toFixed(2));
}

/**
 * Calculate total investment value
 */
export function calculateTotalValue(investments: Investment[]): number {
  return investments.reduce((total, inv) => {
    return total + inv.currentPrice * inv.quantity;
  }, 0);
}

/**
 * Calculate portfolio weight for an investment
 */
export function calculatePortfolioWeight(
  investment: Investment,
  totalValue: number
): number {
  if (totalValue === 0) return 0;

  const invValue = investment.currentPrice * investment.quantity;
  return Number(((invValue / totalValue) * 100).toFixed(2));
}

/**
 * Format currency to VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

/**
 * Calculate average buy price from transactions
 */
export function calculateAverageBuyPrice(
  transactions: Array<{ price: number; quantity: number }>
): number {
  if (transactions.length === 0) return 0;

  const totalCost = transactions.reduce((sum, t) => sum + t.price * t.quantity, 0);
  const totalQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0);

  if (totalQuantity === 0) return 0;

  return Number((totalCost / totalQuantity).toFixed(2));
}

/**
 * Calculate compound interest (lãi kép)
 */
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  years: number,
  frequency: number = 12 // Monthly by default
): number {
  const amount = principal * Math.pow(1 + rate / frequency, frequency * years);
  return Number(amount.toFixed(0));
}

/**
 * Calculate monthly savings needed to reach goal
 */
export function calculateMonthlySavingsForGoal(
  targetAmount: number,
  currentAmount: number,
  monthsRemaining: number,
  annualReturn: number = 0.08 // 8% annual return default
): number {
  if (monthsRemaining <= 0) return 0;

  const remaining = targetAmount - currentAmount;
  const monthlyRate = annualReturn / 12;

  if (monthlyRate === 0) {
    return remaining / monthsRemaining;
  }

  // Future Value of Annuity formula
  const monthlySavings =
    remaining / (((Math.pow(1 + monthlyRate, monthsRemaining) - 1) / monthlyRate));

  return Number(monthlySavings.toFixed(0));
}

/**
 * Calculate break-even price
 */
export function calculateBreakEvenPrice(
  avgPrice: number,
  feePercentage: number = 0.003 // 0.3% fee
): number {
  return avgPrice * (1 + feePercentage * 2); // Buy + Sell fees
}

/**
 * Calculate net profit after fees
 */
export function calculateNetProfit(
  sellPrice: number,
  buyPrice: number,
  quantity: number,
  feePercentage: number = 0.003
): number {
  const revenue = sellPrice * quantity * (1 - feePercentage);
  const cost = buyPrice * quantity * (1 + feePercentage);
  return Number((revenue - cost).toFixed(0));
}

/**
 * Calculate cash flow from transactions
 */
export function calculateCashFlow(transactions: Transaction[]): {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
} {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    if (t.type === 'INCOME') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }
  }

  return {
    totalIncome,
    totalExpense,
    netCashFlow: totalIncome - totalExpense,
  };
}

/**
 * Calculate savings rate
 */
export function calculateSavingsRate(income: number, expenses: number): number {
  if (income === 0) return 0;
  return Number((((income - expenses) / income) * 100).toFixed(2));
}

/**
 * Calculate FIRE number (Financial Independence, Retire Early)
 */
export function calculateFIRENumber(
  annualExpenses: number,
  withdrawalRate: number = 0.04 // 4% rule
): number {
  return Math.ceil(annualExpenses / withdrawalRate);
}

/**
 * Calculate time to FIRE
 */
export function calculateTimeToFIRE(
  currentSavings: number,
  monthlyInvestment: number,
  targetAmount: number,
  annualReturn: number = 0.08
): number {
  if (monthlyInvestment <= 0) return Infinity;

  const monthlyRate = annualReturn / 12;
  let balance = currentSavings;
  let months = 0;

  while (balance < targetAmount && months < 600) {
    // Max 50 years
    balance = balance * (1 + monthlyRate) + monthlyInvestment;
    months++;
  }

  return months >= 600 ? Infinity : months;
}
