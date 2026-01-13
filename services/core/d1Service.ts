/**
 * D1 Database Service
 * Wrapper for Cloudflare D1 database operations
 */

import type {
  Transaction,
  Investment,
  Goal,
  WatchlistItem,
  PriceData,
  SharkSignal,
  TradingRules,
} from '../../types';

export interface D1ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class D1Service {
  constructor(private db: D1Database) {}

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================

  async getAllTransactions(): Promise<D1ServiceResult<Transaction[]>> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM transactions ORDER BY date DESC')
        .all();

      return {
        success: true,
        data: result.results as Transaction[],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async createTransaction(transaction: Transaction): Promise<D1ServiceResult<Transaction>> {
    try {
      await this.db
        .prepare(
          `INSERT INTO transactions (id, date, category, amount, type, note)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          transaction.id,
          transaction.date,
          transaction.category,
          transaction.amount,
          transaction.type,
          transaction.note
        )
        .run();

      return {
        success: true,
        data: transaction,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async deleteTransaction(id: string): Promise<D1ServiceResult<void>> {
    try {
      await this.db.prepare('DELETE FROM transactions WHERE id = ?').bind(id).run();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================================================
  // INVESTMENTS
  // ============================================================================

  async getAllInvestments(): Promise<D1ServiceResult<Investment[]>> {
    try {
      const result = await this.db.prepare('SELECT * FROM investments').all();

      return {
        success: true,
        data: result.results as Investment[],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async createInvestment(investment: Investment): Promise<D1ServiceResult<Investment>> {
    try {
      await this.db
        .prepare(
          `INSERT INTO investments (id, symbol, type, quantity, avg_price, current_price)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          investment.id,
          investment.symbol,
          investment.type,
          investment.quantity,
          investment.avgPrice,
          investment.currentPrice
        )
        .run();

      return {
        success: true,
        data: investment,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async updateInvestmentPrice(
    symbol: string,
    currentPrice: number
  ): Promise<D1ServiceResult<void>> {
    try {
      await this.db
        .prepare('UPDATE investments SET current_price = ? WHERE symbol = ?')
        .bind(currentPrice, symbol)
        .run();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================================================
  // PRICE HISTORY
  // ============================================================================

  async savePriceData(priceData: PriceData): Promise<D1ServiceResult<void>> {
    try {
      await this.db
        .prepare(
          `INSERT OR REPLACE INTO price_history
           (symbol, date, open_price, close_price, high_price, low_price, volume)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          priceData.symbol,
          priceData.date,
          priceData.openPrice,
          priceData.closePrice,
          priceData.highPrice,
          priceData.lowPrice,
          priceData.volume
        )
        .run();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getPriceHistory(
    symbol: string,
    days: number = 30
  ): Promise<D1ServiceResult<PriceData[]>> {
    try {
      const result = await this.db
        .prepare(
          `SELECT * FROM price_history
           WHERE symbol = ?
           ORDER BY date DESC
           LIMIT ?`
        )
        .bind(symbol, days)
        .all();

      return {
        success: true,
        data: result.results as PriceData[],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getLatestPrice(symbol: string): Promise<D1ServiceResult<PriceData | null>> {
    try {
      const result = await this.db
        .prepare(
          `SELECT * FROM price_history
           WHERE symbol = ?
           ORDER BY date DESC
           LIMIT 1`
        )
        .bind(symbol)
        .first();

      return {
        success: true,
        data: result as PriceData | null,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================================================
  // SHARK SIGNALS
  // ============================================================================

  async saveSharkSignal(signal: SharkSignal): Promise<D1ServiceResult<void>> {
    try {
      await this.db
        .prepare(
          `INSERT OR REPLACE INTO shark_signals
           (symbol, date, status, avg_volume_20d, current_volume, volume_ratio,
            price_change, signal_description, signal_icon)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          signal.symbol,
          signal.date,
          signal.status,
          signal.avgVolume20d,
          signal.currentVolume,
          signal.volumeRatio,
          signal.priceChange,
          signal.signalDescription,
          signal.signalIcon
        )
        .run();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getSharkSignals(days: number = 7): Promise<D1ServiceResult<SharkSignal[]>> {
    try {
      const result = await this.db
        .prepare(
          `SELECT * FROM shark_signals
           WHERE date >= date('now', '-' || ? || ' days')
           ORDER BY date DESC, volume_ratio DESC`
        )
        .bind(days)
        .all();

      return {
        success: true,
        data: result.results as SharkSignal[],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getSharkSignalsBySymbol(symbol: string): Promise<D1ServiceResult<SharkSignal[]>> {
    try {
      const result = await this.db
        .prepare(
          `SELECT * FROM shark_signals
           WHERE symbol = ?
           ORDER BY date DESC
           LIMIT 30`
        )
        .bind(symbol)
        .all();

      return {
        success: true,
        data: result.results as SharkSignal[],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================================================
  // WATCHLIST
  // ============================================================================

  async getWatchlist(): Promise<D1ServiceResult<WatchlistItem[]>> {
    try {
      const result = await this.db.prepare('SELECT * FROM watchlist ORDER BY symbol').all();

      return {
        success: true,
        data: result.results as WatchlistItem[],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async addToWatchlist(item: WatchlistItem): Promise<D1ServiceResult<void>> {
    try {
      await this.db
        .prepare(
          `INSERT OR REPLACE INTO watchlist
           (id, symbol, status, alert_price_max, alert_price_min, note)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          item.id,
          item.symbol,
          item.status,
          item.alertPriceMax || null,
          item.alertPriceMin || null,
          item.note || null
        )
        .run();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async removeFromWatchlist(symbol: string): Promise<D1ServiceResult<void>> {
    try {
      await this.db.prepare('DELETE FROM watchlist WHERE symbol = ?').bind(symbol).run();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================================================
  // TRADING RULES
  // ============================================================================

  async getTradingRules(): Promise<D1ServiceResult<TradingRules | null>> {
    try {
      const result = await this.db.prepare('SELECT * FROM trading_rules WHERE id = 1').first();

      return {
        success: true,
        data: result as TradingRules | null,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async updateTradingRules(rules: TradingRules): Promise<D1ServiceResult<void>> {
    try {
      await this.db
        .prepare(
          `UPDATE trading_rules SET
           take_profit_threshold = ?,
           scaling_out_rate = ?,
           rsi_overbought = ?,
           rsi_oversold = ?,
           volume_surge_threshold = ?,
           lookback_period = ?,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = 1`
        )
        .bind(
          rules.takeProfitThreshold,
          rules.scalingOutRate,
          rules.rsiOverbought,
          rules.rsiOversold,
          rules.volumeSurgeThreshold,
          rules.lookbackPeriod
        )
        .run();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================================================
  // GOALS
  // ============================================================================

  async getAllGoals(): Promise<D1ServiceResult<Goal[]>> {
    try {
      const result = await this.db.prepare('SELECT * FROM goals ORDER BY deadline').all();

      return {
        success: true,
        data: result.results as Goal[],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async createGoal(goal: Goal): Promise<D1ServiceResult<Goal>> {
    try {
      await this.db
        .prepare(
          `INSERT INTO goals (id, title, target_amount, current_amount, deadline, type)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
          goal.id,
          goal.title,
          goal.targetAmount,
          goal.currentAmount,
          goal.deadline,
          goal.type
        )
        .run();

      return {
        success: true,
        data: goal,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async updateGoalProgress(id: string, currentAmount: number): Promise<D1ServiceResult<void>> {
    try {
      await this.db
        .prepare('UPDATE goals SET current_amount = ? WHERE id = ?')
        .bind(currentAmount, id)
        .run();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
