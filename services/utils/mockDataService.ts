/**
 * Mock Data Service
 * Generate fake data for testing
 */

import type { PriceData, SharkSignal, Investment } from '../../types';
import { getCurrentDate } from '../core/configService';

/**
 * Generate mock price history for a symbol
 */
export function generateMockPriceHistory(
  symbol: string,
  days: number = 30,
  basePrice: number = 25000
): PriceData[] {
  const prices: PriceData[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Random price movement
    const randomChange = (Math.random() - 0.5) * 0.05; // ±2.5%
    const openPrice = basePrice * (1 + randomChange);
    const closeChange = (Math.random() - 0.5) * 0.03; // ±1.5%
    const closePrice = openPrice * (1 + closeChange);

    const highPrice = Math.max(openPrice, closePrice) * (1 + Math.random() * 0.02);
    const lowPrice = Math.min(openPrice, closePrice) * (1 - Math.random() * 0.02);

    // Random volume
    const baseVolume = 5000000;
    const volume = Math.floor(baseVolume * (0.7 + Math.random() * 0.6)); // 70%-130%

    prices.push({
      symbol,
      date: date.toISOString().split('T')[0],
      openPrice: Math.round(openPrice),
      closePrice: Math.round(closePrice),
      highPrice: Math.round(highPrice),
      lowPrice: Math.round(lowPrice),
      volume,
    });

    // Update base price for next iteration
    basePrice = closePrice;
  }

  return prices.reverse(); // Oldest first
}

/**
 * Generate mock RSI value
 */
export function generateMockRSI(): number {
  return Math.floor(30 + Math.random() * 40); // 30-70 range
}

/**
 * Get mock market data for popular Vietnamese stocks
 */
export function getMockMarketData(): Map<string, PriceData[]> {
  const symbols = ['HPG', 'VNM', 'TCB', 'VCB', 'CTR', 'MBB', 'VHM', 'VIC'];
  const data = new Map<string, PriceData[]>();

  for (const symbol of symbols) {
    const basePrice = 20000 + Math.random() * 30000; // 20k-50k VND
    data.set(symbol, generateMockPriceHistory(symbol, 30, basePrice));
  }

  return data;
}

/**
 * Generate mock shark signal
 */
export function generateMockSharkSignal(symbol: string): SharkSignal {
  const statuses: Array<'ACCUMULATING' | 'PUMPING' | 'DISTRIBUTING' | 'QUIET'> = [
    'ACCUMULATING',
    'PUMPING',
    'DISTRIBUTING',
    'QUIET',
  ];

  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const avgVolume = 5000000;
  const volumeRatio = 0.5 + Math.random() * 2; // 0.5x - 2.5x
  const currentVolume = Math.floor(avgVolume * volumeRatio);
  const priceChange = -3 + Math.random() * 8; // -3% to +5%

  const icons = {
    ACCUMULATING: '💎',
    PUMPING: '🔥',
    DISTRIBUTING: '⚠️',
    QUIET: '🦈',
  };

  const descriptions = {
    ACCUMULATING: 'Cá mập đang âm thầm gom hàng. Giá đi ngang, khối lượng thấp.',
    PUMPING: 'Dòng tiền lớn đang nhập cuộc! Breakout mạnh.',
    DISTRIBUTING: 'Cá mập đang thoát hàng. Cẩn thận!',
    QUIET: 'Thị trường bình thường.',
  };

  return {
    symbol,
    date: getCurrentDate(),
    status,
    avgVolume20d: avgVolume,
    currentVolume,
    volumeRatio: Number(volumeRatio.toFixed(2)),
    priceChange: Number(priceChange.toFixed(2)),
    signalDescription: descriptions[status],
    signalIcon: icons[status],
  };
}

/**
 * Generate mock investment portfolio
 */
export function generateMockPortfolio(): Investment[] {
  return [
    {
      id: '1',
      symbol: 'HPG',
      type: 'STOCK',
      quantity: 1000,
      avgPrice: 24500,
      currentPrice: 27150,
    },
    {
      id: '2',
      symbol: 'TCB',
      type: 'STOCK',
      quantity: 500,
      avgPrice: 32000,
      currentPrice: 35500,
    },
    {
      id: '3',
      symbol: 'VNM',
      type: 'STOCK',
      quantity: 300,
      avgPrice: 85000,
      currentPrice: 82000,
    },
  ];
}

/**
 * Seed database with mock data
 */
export async function seedMockData(d1Service: any): Promise<void> {
  try {
    // Generate and save mock price history
    const marketData = getMockMarketData();

    for (const [symbol, prices] of marketData.entries()) {
      for (const price of prices) {
        await d1Service.savePriceData(price);
      }

      // Generate shark signal for each symbol
      const signal = generateMockSharkSignal(symbol);
      await d1Service.saveSharkSignal(signal);
    }

    // Save mock portfolio
    const portfolio = generateMockPortfolio();
    for (const inv of portfolio) {
      await d1Service.createInvestment(inv);
    }

    console.log('✅ Mock data seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed mock data:', error);
    throw error;
  }
}
