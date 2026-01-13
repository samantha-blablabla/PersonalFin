
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  type: TransactionType;
  note: string;
}

export interface Investment {
  id: string;
  symbol: string;
  type: 'STOCK' | 'FUND';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  type: 'SHORT' | 'LONG';
}

// ============================================================================
// SHARK TRACKER & VSA (Volume Spread Analysis)
// ============================================================================

export enum MarketAction {
  ACCUMULATING = 'ACCUMULATING', // Cá mập đang gom hàng
  PUMPING = 'PUMPING',           // Đang bơm giá lên
  DISTRIBUTING = 'DISTRIBUTING', // Đang phân phối (xả hàng)
  QUIET = 'QUIET'                // Không có tín hiệu đặc biệt
}

export interface VolumeProfile {
  symbol: string;
  date: string;
  avgVolume20d: number;      // Khối lượng trung bình 20 phiên
  currentVolume: number;     // Khối lượng hiện tại
  volumeRatio: number;       // Tỷ lệ: currentVolume / avgVolume20d
  volumeSurge: boolean;      // Có đột biến khối lượng không (>1.5x)
}

export interface SharkSignal {
  id?: number;
  symbol: string;
  date: string;
  status: MarketAction;
  avgVolume20d: number;
  currentVolume: number;
  volumeRatio: number;
  priceChange: number;       // % thay đổi giá
  signalDescription: string; // Mô tả tín hiệu
  signalIcon: string;        // Icon: 🦈⚓🔥🚨
  createdAt?: string;
}

export interface PriceData {
  id?: number;
  symbol: string;
  date: string;
  openPrice: number;
  closePrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  createdAt?: string;
}

// ============================================================================
// TRADING RULES & CONFIGURATION
// ============================================================================

export interface TradingRules {
  id?: number;
  takeProfitThreshold: number;   // Ngưỡng chốt lời (default 0.25 = 25%)
  scalingOutRate: number;        // Tỷ lệ chốt từng phần (default 0.30 = 30%)
  rsiOverbought: number;         // RSI quá mua (default 75)
  rsiOversold: number;           // RSI quá bán (default 35)
  volumeSurgeThreshold: number;  // Ngưỡng đột biến volume (default 1.5)
  lookbackPeriod: number;        // Số phiên tính toán (default 20)
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// WATCHLIST
// ============================================================================

export enum WatchlistStatus {
  WATCHING = 'WATCHING',
  OVERBOUGHT = 'OVERBOUGHT',
  GOOD_BUY_ZONE = 'GOOD_BUY_ZONE',
  ALERT_TRIGGERED = 'ALERT_TRIGGERED'
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  status: WatchlistStatus;
  alertPriceMax?: number;  // Cảnh báo khi giá > max
  alertPriceMin?: number;  // Cảnh báo khi giá < min
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// TECHNICAL INDICATORS
// ============================================================================

export interface TechnicalIndicator {
  symbol: string;
  date: string;
  rsi?: number;              // Relative Strength Index (0-100)
  ma20?: number;             // Moving Average 20 periods
  ma50?: number;             // Moving Average 50 periods
  volumeAvg?: number;        // Average volume
  priceChange?: number;      // % price change
}

// ============================================================================
// STRATEGY & SIGNALS
// ============================================================================

export enum StrategySignalType {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD',
  WATCH = 'WATCH'
}

export interface StrategySignal {
  symbol: string;
  signal: StrategySignalType;
  confidence: number;        // 0-100, độ tin cậy
  reason: string;            // Lý do đưa ra tín hiệu
  indicators: {
    rsi?: number;
    volumeRatio?: number;
    priceChange?: number;
    sharkAction?: MarketAction;
  };
  timestamp: string;
}

// ============================================================================
// REBALANCING
// ============================================================================

export interface RebalancingProposal {
  id: string;
  fromSymbol: string;        // Bán từ mã này
  toSymbol: string;          // Mua sang mã này
  sellQuantity: number;      // Số lượng bán
  sellValue: number;         // Giá trị thu về
  buyQuantity: number;       // Số lượng mua được
  reason: string;            // Lý do tái cơ cấu
  expectedGain: number;      // Lợi nhuận kỳ vọng (%)
  createdAt: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
