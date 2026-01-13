/**
 * Data Validators
 * Validation functions for data integrity
 */

import type {
  Transaction,
  Investment,
  Goal,
  WatchlistItem,
  TradingRules,
} from '../../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate Transaction
 */
export function validateTransaction(data: Partial<Transaction>): ValidationResult {
  const errors: string[] = [];

  if (!data.id || data.id.trim() === '') {
    errors.push('ID là bắt buộc');
  }

  if (!data.date || data.date.trim() === '') {
    errors.push('Ngày giao dịch là bắt buộc');
  }

  if (!data.category || data.category.trim() === '') {
    errors.push('Danh mục là bắt buộc');
  }

  if (data.amount === undefined || data.amount <= 0) {
    errors.push('Số tiền phải lớn hơn 0');
  }

  if (!data.type || !['INCOME', 'EXPENSE'].includes(data.type)) {
    errors.push('Loại giao dịch không hợp lệ');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Investment
 */
export function validateInvestment(data: Partial<Investment>): ValidationResult {
  const errors: string[] = [];

  if (!data.id || data.id.trim() === '') {
    errors.push('ID là bắt buộc');
  }

  if (!data.symbol || data.symbol.trim() === '') {
    errors.push('Mã cổ phiếu là bắt buộc');
  } else if (!/^[A-Z]{3}$/.test(data.symbol)) {
    errors.push('Mã cổ phiếu phải là 3 chữ cái IN HOA (VD: HPG, VNM)');
  }

  if (!data.type || !['STOCK', 'FUND'].includes(data.type)) {
    errors.push('Loại đầu tư không hợp lệ');
  }

  if (data.quantity === undefined || data.quantity <= 0) {
    errors.push('Số lượng phải lớn hơn 0');
  }

  if (data.avgPrice === undefined || data.avgPrice <= 0) {
    errors.push('Giá mua trung bình phải lớn hơn 0');
  }

  if (data.currentPrice === undefined || data.currentPrice < 0) {
    errors.push('Giá hiện tại không hợp lệ');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Goal
 */
export function validateGoal(data: Partial<Goal>): ValidationResult {
  const errors: string[] = [];

  if (!data.id || data.id.trim() === '') {
    errors.push('ID là bắt buộc');
  }

  if (!data.title || data.title.trim() === '') {
    errors.push('Tiêu đề mục tiêu là bắt buộc');
  }

  if (data.targetAmount === undefined || data.targetAmount <= 0) {
    errors.push('Số tiền mục tiêu phải lớn hơn 0');
  }

  if (data.currentAmount !== undefined && data.currentAmount < 0) {
    errors.push('Số tiền hiện tại không được âm');
  }

  if (!data.deadline || data.deadline.trim() === '') {
    errors.push('Deadline là bắt buộc');
  } else {
    const deadlineDate = new Date(data.deadline);
    if (isNaN(deadlineDate.getTime())) {
      errors.push('Deadline không đúng định dạng');
    } else if (deadlineDate < new Date()) {
      errors.push('Deadline phải là ngày trong tương lai');
    }
  }

  if (!data.type || !['SHORT', 'LONG'].includes(data.type)) {
    errors.push('Loại mục tiêu không hợp lệ');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate WatchlistItem
 */
export function validateWatchlistItem(data: Partial<WatchlistItem>): ValidationResult {
  const errors: string[] = [];

  if (!data.id || data.id.trim() === '') {
    errors.push('ID là bắt buộc');
  }

  if (!data.symbol || data.symbol.trim() === '') {
    errors.push('Mã cổ phiếu là bắt buộc');
  } else if (!/^[A-Z]{3}$/.test(data.symbol)) {
    errors.push('Mã cổ phiếu phải là 3 chữ cái IN HOA');
  }

  if (data.alertPriceMax !== undefined && data.alertPriceMax <= 0) {
    errors.push('Giá cảnh báo tối đa phải lớn hơn 0');
  }

  if (data.alertPriceMin !== undefined && data.alertPriceMin <= 0) {
    errors.push('Giá cảnh báo tối thiểu phải lớn hơn 0');
  }

  if (
    data.alertPriceMax !== undefined &&
    data.alertPriceMin !== undefined &&
    data.alertPriceMin >= data.alertPriceMax
  ) {
    errors.push('Giá cảnh báo tối thiểu phải nhỏ hơn giá tối đa');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate TradingRules
 */
export function validateTradingRules(data: Partial<TradingRules>): ValidationResult {
  const errors: string[] = [];

  if (data.takeProfitThreshold !== undefined) {
    if (data.takeProfitThreshold <= 0 || data.takeProfitThreshold > 1) {
      errors.push('Ngưỡng chốt lời phải từ 0 đến 1 (0-100%)');
    }
  }

  if (data.scalingOutRate !== undefined) {
    if (data.scalingOutRate <= 0 || data.scalingOutRate > 1) {
      errors.push('Tỷ lệ chốt lời phải từ 0 đến 1 (0-100%)');
    }
  }

  if (data.rsiOverbought !== undefined) {
    if (data.rsiOverbought < 50 || data.rsiOverbought > 100) {
      errors.push('RSI quá mua phải từ 50 đến 100');
    }
  }

  if (data.rsiOversold !== undefined) {
    if (data.rsiOversold < 0 || data.rsiOversold > 50) {
      errors.push('RSI quá bán phải từ 0 đến 50');
    }
  }

  if (data.volumeSurgeThreshold !== undefined && data.volumeSurgeThreshold <= 0) {
    errors.push('Ngưỡng đột biến volume phải lớn hơn 0');
  }

  if (data.lookbackPeriod !== undefined) {
    if (data.lookbackPeriod < 5 || data.lookbackPeriod > 100) {
      errors.push('Số phiên tra cứu phải từ 5 đến 100');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate stock symbol format
 */
export function isValidStockSymbol(symbol: string): boolean {
  return /^[A-Z]{3}$/.test(symbol);
}

/**
 * Validate date format (ISO: YYYY-MM-DD)
 */
export function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: any): boolean {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

/**
 * Validate percentage (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}
