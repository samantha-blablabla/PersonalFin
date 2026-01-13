/**
 * Config Service
 * Application configuration and constants
 */

export const DEFAULT_TRADING_RULES = {
  takeProfitThreshold: 0.25,   // 25% profit
  scalingOutRate: 0.30,        // 30% sell each time
  rsiOverbought: 75,
  rsiOversold: 35,
  volumeSurgeThreshold: 1.5,   // 1.5x average volume
  lookbackPeriod: 20,          // 20 trading sessions
};

export const VSA_RULES = {
  BIG_MONEY_PRICE_THRESHOLD: 0.02,      // 2% price increase
  BIG_MONEY_VOLUME_THRESHOLD: 1.5,      // 1.5x average volume
  DISTRIBUTION_VOLUME_THRESHOLD: 1.5,   // 1.5x volume on red candle
  LOW_SUPPLY_PRICE_RANGE: 0.005,        // ±0.5% sideways
  LOW_SUPPLY_VOLUME_THRESHOLD: 0.7,     // 0.7x average volume
  PUMP_DUMP_PRICE_THRESHOLD: 0.03,      // 3% price increase
  PUMP_DUMP_VOLUME_THRESHOLD: 1.2,      // Only 1.2x volume (weak)
};

export const SHARK_SIGNAL_ICONS = {
  BIG_MONEY: '🚀',
  DISTRIBUTION: '⚠️',
  LOW_SUPPLY: '💎',
  PUMP_DUMP: '🚨',
  SHARK: '🦈',
  ANCHOR: '⚓',
  FIRE: '🔥',
};

export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PRICE_HISTORY_DAYS: 30,
  DEFAULT_SHARK_SIGNALS_DAYS: 7,
};

export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATE: 'DD/MM/YYYY',
};

export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
