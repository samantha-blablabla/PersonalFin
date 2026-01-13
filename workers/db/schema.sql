-- FinTrack Pro VN - Cloudflare D1 Database Schema
-- Created: 2026-01-13
-- Purpose: Store financial transactions, investments, watchlist, price history, and VSA signals

-- ============================================================================
-- TABLE 1: transactions - Thu chi hàng ngày
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('INCOME', 'EXPENSE')),
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- ============================================================================
-- TABLE 2: investments - Danh mục đầu tư
-- ============================================================================
CREATE TABLE IF NOT EXISTS investments (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('STOCK', 'FUND')),
  quantity INTEGER NOT NULL,
  avg_price REAL NOT NULL,
  current_price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_investments_symbol ON investments(symbol);

-- ============================================================================
-- TABLE 3: goals - Mục tiêu tài chính
-- ============================================================================
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL NOT NULL DEFAULT 0,
  deadline TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('SHORT', 'LONG')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline);

-- ============================================================================
-- TABLE 4: watchlist - Danh sách theo dõi
-- ============================================================================
CREATE TABLE IF NOT EXISTS watchlist (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'WATCHING',
  alert_price_max REAL,
  alert_price_min REAL,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_watchlist_symbol ON watchlist(symbol);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON watchlist(status);

-- ============================================================================
-- TABLE 5: price_history - Lịch sử giá OHLCV
-- ============================================================================
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  open_price REAL NOT NULL,
  close_price REAL NOT NULL,
  high_price REAL NOT NULL,
  low_price REAL NOT NULL,
  volume INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, date)
);

CREATE INDEX IF NOT EXISTS idx_price_history_symbol_date ON price_history(symbol, date DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date DESC);

-- ============================================================================
-- TABLE 6: shark_signals - VSA Volume Spread Analysis Tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS shark_signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ACCUMULATING', 'PUMPING', 'DISTRIBUTING', 'QUIET')),
  avg_volume_20d INTEGER NOT NULL,
  current_volume INTEGER NOT NULL,
  volume_ratio REAL NOT NULL,
  price_change REAL NOT NULL,
  signal_description TEXT,
  signal_icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(symbol, date)
);

CREATE INDEX IF NOT EXISTS idx_shark_signals_symbol_date ON shark_signals(symbol, date DESC);
CREATE INDEX IF NOT EXISTS idx_shark_signals_status ON shark_signals(status);
CREATE INDEX IF NOT EXISTS idx_shark_signals_date ON shark_signals(date DESC);

-- ============================================================================
-- TABLE 7: trading_rules - Cấu hình trading (singleton)
-- ============================================================================
CREATE TABLE IF NOT EXISTS trading_rules (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  take_profit_threshold REAL NOT NULL DEFAULT 0.25,
  scaling_out_rate REAL NOT NULL DEFAULT 0.30,
  rsi_overbought INTEGER NOT NULL DEFAULT 75,
  rsi_oversold INTEGER NOT NULL DEFAULT 35,
  volume_surge_threshold REAL NOT NULL DEFAULT 1.5,
  lookback_period INTEGER NOT NULL DEFAULT 20,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default trading rules
INSERT OR IGNORE INTO trading_rules (id) VALUES (1);

-- ============================================================================
-- TABLE 8: schema_migrations - Track database migrations
-- ============================================================================
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial migration
INSERT OR IGNORE INTO schema_migrations (version, name)
VALUES (1, 'initial_schema');
