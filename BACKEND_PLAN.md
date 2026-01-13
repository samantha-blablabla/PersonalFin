# BACKEND DEVELOPMENT PLAN - FINTRACK PRO VN

## TỔNG QUAN DỰ ÁN
Xây dựng hệ thống backend logic cho ứng dụng quản lý tài chính cá nhân với tính năng Smart Trading & Exit Strategy, tập trung vào thị trường chứng khoán Việt Nam (VNINDEX).

### Core Features:
- **Smart Trading & Exit Strategy**: Chốt lời theo ngưỡng, tái cơ cấu danh mục
- **VSA - Shark Tracker**: Phân tích Volume Spread Analysis, theo dõi "dấu chân cá mập"
- **Technical Analysis**: RSI, Moving Average, Price Action
- **Watchlist & Alerts**: Theo dõi mã cổ phiếu, cảnh báo giá và volume

### Tech Stack:
- **Frontend**: React 19 + TypeScript + Vite
- **Database**: Cloudflare D1 (SQLite-based)
- **Deployment**: Cloudflare Workers + Wrangler CLI
- **AI**: Google Gemini AI (Financial Advisor)
- **Automation**: n8n (Price crawling, notifications)

---

## KIẾN TRÚC HỆ THỐNG

### 1. LAYERS ARCHITECTURE
```
┌─────────────────────────────────────────────┐
│      Components (UI - GAS)                  │
├─────────────────────────────────────────────┤
│      Services (Business Logic)              │
├─────────────────────────────────────────────┤
│      Models & Types (Data Schema)           │
├─────────────────────────────────────────────┤
│      Cloudflare D1 Database (SQLite)        │
│      + Cloudflare Workers (API Layer)       │
└─────────────────────────────────────────────┘
```

### 1.1. CLOUDFLARE INFRASTRUCTURE
```
┌──────────────────────────────────────────────────┐
│  Frontend (React SPA)                            │
│  Deployed on: Cloudflare Pages                   │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│  Cloudflare Workers (API Endpoints)              │
│  - RESTful API handlers                          │
│  - Business logic execution                      │
│  - Authentication & validation                   │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│  Cloudflare D1 Database (SQLite)                 │
│  - Transactions, Investments, Goals              │
│  - Watchlist, Trading Rules                      │
│  - Price History, Volume Data                    │
│  - Shark Tracker Signals                         │
└──────────────────────────────────────────────────┘
```

### 2. SERVICES STRUCTURE
```
services/
├── core/
│   ├── d1Service.ts                # Cloudflare D1 database operations
│   ├── dataService.ts              # Data management layer
│   └── configService.ts            # App configuration
├── trading/
│   ├── tradingRulesService.ts      # Trading rules logic
│   ├── technicalIndicatorService.ts # RSI, MA, indicators
│   ├── watchlistService.ts         # Watchlist management
│   ├── rebalancingService.ts       # Portfolio rebalancing
│   ├── volumeAnalysisService.ts    # Volume calculations (VSA)
│   └── sharkTrackerService.ts      # 🆕 Shark detection & analysis
├── strategy/
│   ├── strategyAnalysisService.ts  # Buy/Sell suggestions
│   ├── priceAlertService.ts        # Price alerts logic
│   └── profitTargetService.ts      # Profit target tracking
├── external/
│   ├── geminiService.ts            # AI advisor (existing)
│   └── priceAPIService.ts          # Future: real-time prices
└── utils/
    ├── calculators.ts              # Financial calculations
    ├── validators.ts               # Data validation
    └── formatters.ts               # Data formatting
```

### 3. CLOUDFLARE WORKERS STRUCTURE
```
workers/
├── api/
│   ├── index.ts                    # Main worker entry point
│   ├── routes.ts                   # API routes configuration
│   └── middleware/
│       ├── auth.ts                 # Authentication
│       ├── cors.ts                 # CORS handling
│       └── errorHandler.ts         # Error handling
├── handlers/
│   ├── transactions.ts             # Transaction endpoints
│   ├── investments.ts              # Investment endpoints
│   ├── watchlist.ts                # Watchlist endpoints
│   ├── sharkTracker.ts             # 🆕 Shark tracker endpoints
│   └── analytics.ts                # Analytics endpoints
└── db/
    ├── schema.sql                  # D1 database schema
    ├── migrations/                 # Database migrations
    └── seeds.sql                   # Seed data for testing
```

---

## ROADMAP ƯU TIÊN (HIGH → LOW)

### 🔴 PHASE 0: CLOUDFLARE SETUP (Ưu tiên cao nhất - Infrastructure)
**Mục tiêu**: Setup Cloudflare infrastructure và database

#### 0.1. Wrangler CLI Setup
**Files**: `wrangler.toml`, `.dev.vars`
- Cài đặt Wrangler CLI: `npm install -g wrangler`
- Login Cloudflare: `wrangler login`
- Khởi tạo project config: `wrangler init`
- Setup environment variables

#### 0.2. D1 Database Setup
**Files**: `workers/db/schema.sql`
- Tạo D1 database: `wrangler d1 create fintrack-db`
- Thiết kế database schema (SQL)
- Tạo migrations
- Apply schema: `wrangler d1 execute fintrack-db --file=schema.sql`

#### 0.3. Cloudflare Workers Project
**Files**: `workers/api/index.ts`
- Setup Workers project structure
- Configure routing và middleware
- Test local development: `wrangler dev`
- Deploy test: `wrangler deploy`

---

### 🔴 PHASE 1: CORE FOUNDATION (Ưu tiên cao nhất)
**Mục tiêu**: Xây dựng nền tảng dữ liệu và storage

#### 1.1. Mở rộng Data Models & Types
**File**: `types.ts`
- Thêm `TradingRules` interface
- Thêm `WatchlistItem` interface
- Thêm `TechnicalIndicator` interface
- Thêm `StrategySignal` enum & interface
- Thêm `RebalancingProposal` interface
- 🆕 Thêm `SharkSignal` interface (VSA)
- 🆕 Thêm `VolumeProfile` interface
- 🆕 Thêm `MarketAction` enum (ACCUMULATING, PUMPING, DISTRIBUTING, QUIET)

#### 1.2. D1 Database Service
**File**: `services/core/d1Service.ts`
- Implement D1 database wrapper với TypeScript
- CRUD operations cho: transactions, investments, goals, watchlist, trading rules
- Query builder helpers
- Connection pooling & error handling
- Migration utilities

#### 1.3. Data Service
**File**: `services/core/dataService.ts`
- Centralized data management layer
- Caching strategy (reduce D1 reads)
- Data validation trước khi lưu
- Batch operations support
- Error handling & retry logic

---

### 🟡 PHASE 2: TRADING LOGIC (Ưu tiên cao)
**Mục tiêu**: Xây dựng các tính năng Smart Trading cốt lõi

#### 2.1. Volume Analysis Service (VSA)
**File**: `services/trading/volumeAnalysisService.ts`
**Functions**:
- `calculateAverageVolume(symbol, lookbackPeriod=20)`: Tính khối lượng TB 20 phiên
- `detectVolumeSurge(currentVolume, avgVolume, threshold=1.5)`: Phát hiện khối lượng đột biến
- `analyzeVolumeSpread(priceChange, volumeChange)`: Phân tích VSA
- `getVolumeProfile(symbol, days)`: Lấy profile khối lượng theo ngày

#### 2.2. Shark Tracker Service (🆕 PRIORITY)
**File**: `services/trading/sharkTrackerService.ts`
**Functions**:
- `analyzeSharkAction(symbol, priceChange, currentVolume, avgVolume)`: Phân tích hành động cá mập
- `classifyMarketStatus(data)`: Phân loại (ACCUMULATING, PUMPING, DISTRIBUTING, QUIET)
- `detectBigMoneyFlow(priceChange, volumeRatio)`: Phát hiện dòng tiền lớn
- `detectDistribution(priceChange, volumeRatio)`: Phát hiện pha phân phối
- `detectLowSupply(priceChange, volumeRatio)`: Phát hiện cạn cung
- `generateSharkSignal(analysis)`: Tạo tín hiệu cá mập với icon (🦈⚓🔥)
- `detectPumpAndDump(priceChange, volumeChange, consecutiveDays)`: Phát hiện "kéo xả"

**VSA Rules**:
- 🚀 **Big Money In**: Price > +2% AND Volume > 1.5x AvgVolume
- ⚠️ **Distribution**: Price < 0% AND Volume surge (đột biến)
- 💎 **Low Supply**: Price đi ngang (±0.5%) AND Volume < 0.7x AvgVolume
- 🚨 **Pump & Dump Alert**: Price tăng mạnh KHÔNG kèm volume tương ứng

#### 2.3. Trading Rules Service
**File**: `services/trading/tradingRulesService.ts`
**Functions**:
- `getTradingRules()`: Lấy cấu hình rules
- `updateTradingRules(rules)`: Cập nhật rules
- `checkProfitThreshold(investment)`: Kiểm tra ngưỡng chốt lời (default 25%)
- `calculateScalingOut(investment, percentage)`: Tính số lượng chốt từng phần (default 30%)

#### 2.4. Technical Indicator Service
**File**: `services/trading/technicalIndicatorService.ts`
**Functions**:
- `calculateRSI(prices, period=14)`: Tính RSI
- `calculateMA(prices, period)`: Tính Moving Average
- `detectOverbought(rsi, threshold=75)`: Phát hiện vùng quá mua
- `detectOversold(rsi, threshold=35)`: Phát hiện vùng quá bán
- `getPriceChangeRate(currentPrice, oldPrice, periods)`: % thay đổi giá

**Note**: Dữ liệu giá lịch sử sẽ lưu trong D1, n8n sẽ cào giá định kỳ

#### 2.5. Rebalancing Service
**File**: `services/trading/rebalancingService.ts`
**Functions**:
- `simulateRebalance(sellSymbol, sellPercent, buySymbol)`: Mô phỏng tái cơ cấu
- `calculateProceedsFromSale(investment, sellPercent)`: Tính tiền thu về
- `calculateBuyQuantity(cashAmount, targetSymbol, currentPrice)`: Tính số lượng mua được
- `generateRebalancingProposal(portfolio, rules)`: Đề xuất tái cơ cấu tự động

---

### 🟢 PHASE 3: STRATEGY & ALERTS (Ưu tiên trung bình)
**Mục tiêu**: Tính năng phân tích và cảnh báo thông minh

#### 3.1. Watchlist Service
**File**: `services/trading/watchlistService.ts`
**Functions**:
- `addToWatchlist(item)`: Thêm mã theo dõi
- `removeFromWatchlist(symbol)`: Xóa khỏi watchlist
- `updateWatchlistItem(symbol, updates)`: Cập nhật thông tin
- `checkWatchlistAlerts(watchlist, currentPrices)`: Kiểm tra điều kiện cảnh báo
- `getWatchlistStatus(item, currentPrice, rsi)`: Trả về trạng thái (WATCHING, OVERBOUGHT, GOOD_BUY_ZONE)

#### 3.2. Strategy Analysis Service
**File**: `services/strategy/strategyAnalysisService.ts`
**Functions**:
- `analyzeBuySignals(watchlist, marketData)`: Phân tích tín hiệu MUA
- `analyzeSellSignals(portfolio, marketData)`: Phân tích tín hiệu BÁN
- `generateSmartActions(portfolio, watchlist, marketData)`: Tổng hợp "Nên làm gì?"
- `categorizeBySignal(stocks)`: Phân loại theo màu (Đỏ/Xanh/Xám)

#### 3.3. Price Alert Service
**File**: `services/strategy/priceAlertService.ts`
**Functions**:
- `checkPriceAlerts(watchlist, currentPrices)`: Kiểm tra cảnh báo giá
- `generateAlertMessage(item, condition)`: Tạo thông báo cảnh báo
- `getAlertLevel(item, currentPrice)`: Xác định mức độ cảnh báo (INFO, WARNING, DANGER)

---

### 🔵 PHASE 4: UTILITIES & HELPERS (Ưu tiên thấp)
**Mục tiêu**: Các hàm tiện ích hỗ trợ

#### 4.1. Calculators
**File**: `services/utils/calculators.ts`
- `calculateROI(investment)`: Tính % lãi/lỗ
- `calculateTotalValue(investments)`: Tổng giá trị danh mục
- `calculatePortfolioWeight(investment, totalValue)`: Tính tỷ trọng
- `formatCurrency(amount)`: Format tiền VND
- `calculateAverageBuyPrice(transactions)`: Tính giá mua TB

#### 4.2. Validators
**File**: `services/utils/validators.ts`
- `validateTransaction(data)`: Validate giao dịch
- `validateInvestment(data)`: Validate đầu tư
- `validateTradingRules(rules)`: Validate trading rules
- `validateWatchlistItem(item)`: Validate watchlist item

#### 4.3. Mock Data Service (cho testing)
**File**: `services/utils/mockDataService.ts`
- `generateMockPriceHistory(symbol, days)`: Tạo lịch sử giá giả
- `generateMockRSI(symbol)`: Tạo RSI giả
- `getMockMarketData()`: Dữ liệu thị trường giả để test

---

## DATABASE SCHEMA (Cloudflare D1)

### Tables Structure

#### 1. `transactions`
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('INCOME', 'EXPENSE')),
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `investments`
```sql
CREATE TABLE investments (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('STOCK', 'FUND')),
  quantity INTEGER NOT NULL,
  avg_price REAL NOT NULL,
  current_price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `goals`
```sql
CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL NOT NULL DEFAULT 0,
  deadline TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('SHORT', 'LONG')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. `watchlist` (🆕)
```sql
CREATE TABLE watchlist (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'WATCHING',
  alert_price_max REAL,
  alert_price_min REAL,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. `price_history` (🆕)
```sql
CREATE TABLE price_history (
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

CREATE INDEX idx_price_history_symbol_date ON price_history(symbol, date DESC);
```

#### 6. `shark_signals` (🆕 VSA Tracking)
```sql
CREATE TABLE shark_signals (
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

CREATE INDEX idx_shark_signals_symbol_date ON shark_signals(symbol, date DESC);
```

#### 7. `trading_rules` (🆕)
```sql
CREATE TABLE trading_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  take_profit_threshold REAL NOT NULL DEFAULT 0.25,
  scaling_out_rate REAL NOT NULL DEFAULT 0.30,
  rsi_overbought INTEGER NOT NULL DEFAULT 75,
  rsi_oversold INTEGER NOT NULL DEFAULT 35,
  volume_surge_threshold REAL NOT NULL DEFAULT 1.5,
  lookback_period INTEGER NOT NULL DEFAULT 20,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default rules
INSERT INTO trading_rules (id) VALUES (1);
```

### Data Relationships
```
investments ─┐
             ├─→ price_history (by symbol)
watchlist ───┤
             └─→ shark_signals (by symbol)

transactions → (standalone, for cash flow tracking)
goals → (standalone, for goal tracking)
trading_rules → (singleton config table)
```

---

## PRIORITY MATRIX

| Priority | Phase | Focus | Timeline |
|----------|-------|-------|----------|
| P0 | Phase 0 | Cloudflare Setup | Sprint 0 (Setup) |
| P1 | Phase 1 | Data Models + D1 Database | Sprint 1 |
| P2 | Phase 2 | Trading Logic + VSA/Shark Tracker | Sprint 2-3 |
| P3 | Phase 3 | Strategy & Alerts | Sprint 4 |
| P4 | Phase 4 | Utils & Polish | Sprint 5 |

---

## DEPENDENCIES & INTEGRATION POINTS

### 1. Với UI Components (GAS)
- Components sẽ gọi Cloudflare Workers API endpoints
- Frontend chỉ hiển thị UI, không có business logic
- Tất cả logic tính toán ở Services layer (backend)

### 2. Với n8n Automation
**n8n Workflows cần xây dựng:**

#### Workflow 1: Price Crawler (Chạy mỗi giờ)
```
Schedule Trigger (hourly)
  → HTTP Request (Crawl stock prices from VN market API)
  → JavaScript Node (Parse và validate data)
  → HTTP Request (POST to Cloudflare Workers /api/prices/batch)
  → Save to D1 database (price_history table)
```

#### Workflow 2: Shark Signal Generator (Chạy sau mỗi phiên)
```
Schedule Trigger (end of trading day - 3:30 PM)
  → HTTP Request (GET /api/shark-tracker/analyze)
  → JavaScript Node (Calculate VSA indicators)
  → Conditional Node (Check for shark signals)
  → IF signal detected:
      → Telegram Bot (Send alert với icon 🦈⚓🔥)
      → HTTP Request (POST /api/shark-signals)
```

#### Workflow 3: Price Alert Checker (Chạy mỗi 15 phút)
```
Schedule Trigger (every 15 minutes)
  → HTTP Request (GET /api/watchlist/check-alerts)
  → Conditional Node (Check alert conditions)
  → IF alert triggered:
      → Telegram Bot (Send notification)
```

### 3. Với External APIs
- **Price Data**: VN stock API (cafef.vn, vietstock.vn hoặc SSI API)
- **Future integrations**: Real-time WebSocket cho giá
- n8n làm bridge giữa external API và D1 database

### 4. Data Flow (Updated với Cloudflare)
```
┌─────────────────────────────────────────────────┐
│  User Action (Frontend)                         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  API Call (fetch to Cloudflare Workers)         │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Worker Handler (routes.ts)                     │
│  - Validate request                             │
│  - Call appropriate service                     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Service Layer (Business Logic)                 │
│  - sharkTrackerService.ts                       │
│  - volumeAnalysisService.ts                     │
│  - tradingRulesService.ts                       │
│  etc.                                            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  D1 Database Service (d1Service.ts)             │
│  - Query D1 database                            │
│  - Return data                                  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Response JSON                                  │
│  { success: true, data: {...} }                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Update UI (React Component)                    │
└─────────────────────────────────────────────────┘
```

### 5. n8n ↔ Cloudflare Integration
```
n8n Workflow
  → Crawl stock prices
  → POST https://your-worker.your-subdomain.workers.dev/api/prices/batch
  → Worker validates & saves to D1
  → Return success/error to n8n
  → n8n logs result
```

---

## CODING STANDARDS

### 1. TypeScript Strict Mode
- Luôn type mọi thứ
- Không dùng `any` trừ khi thực sự cần
- Export interfaces và types từ `types.ts`

### 2. Error Handling
- Mọi service function phải có try-catch
- Return `{ success: boolean, data?: T, error?: string }`
- Log errors cho debugging

### 3. Function Naming
- `get*`: Lấy dữ liệu
- `calculate*`: Tính toán
- `validate*`: Kiểm tra validation
- `generate*`: Tạo mới data
- `update*`: Cập nhật data
- `check*`: Kiểm tra điều kiện

### 4. File Organization
- Mỗi service 1 file riêng
- Export named functions
- Import types từ `types.ts`
- Constants và configs ở đầu file

---

## TESTING STRATEGY

### Mock Data Approach
- Tạo `mockDataService.ts` với dữ liệu giả
- Test các service với mock data trước
- UI có thể toggle giữa mock và real data

### Unit Testing (Optional - nếu có thời gian)
- Test các pure functions (calculators, validators)
- Test business logic trong services

---

## CLOUDFLARE DEPLOYMENT CHECKLIST

### Prerequisites
- [ ] Cloudflare account (Free tier OK cho development)
- [ ] Node.js 18+ installed
- [ ] Git repository setup
- [ ] Wrangler CLI installed globally

### Setup Steps
```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Create D1 Database
wrangler d1 create fintrack-db

# 4. Initialize Wrangler config
wrangler init

# 5. Apply database schema
wrangler d1 execute fintrack-db --file=workers/db/schema.sql

# 6. Test locally
wrangler dev

# 7. Deploy to production
wrangler deploy
```

### Environment Variables (.dev.vars)
```
GEMINI_API_KEY=your_api_key_here
TELEGRAM_BOT_TOKEN=your_bot_token_here (future)
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.pages.dev
```

---

## FUTURE ENHANCEMENTS (Post MVP)

### Phase 1 (MVP Complete):
1. ✅ **Cloudflare D1 Database**: Thay localStorage bằng D1
2. ✅ **VSA/Shark Tracker**: Theo dõi dấu chân cá mập
3. ✅ **n8n Price Crawler**: Tự động cào giá
4. ✅ **Smart Trading Rules**: Chốt lời, tái cơ cấu

### Phase 2 (Future Enhancements):
5. **Real-time WebSocket**: Giá real-time thay vì polling
6. **Telegram Bot Integration**: Gửi alerts qua Telegram (đã có n8n support)
7. **Advanced Technical Indicators**: MACD, Bollinger Bands, Fibonacci
8. **Backtesting Module**: Test chiến lược với dữ liệu lịch sử
9. **Portfolio Analytics**: Sharpe ratio, drawdown, risk metrics
10. **AI-powered Predictions**: Dùng Gemini để dự đoán xu hướng
11. **Social Features**: Share strategies, leaderboard
12. **Mobile App**: React Native wrapper

---

## API ENDPOINTS REFERENCE (Cloudflare Workers)

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Investments
- `GET /api/investments` - List portfolio
- `POST /api/investments` - Add investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Remove investment

### Watchlist
- `GET /api/watchlist` - Get watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:symbol` - Remove from watchlist
- `GET /api/watchlist/check-alerts` - Check alert conditions

### Shark Tracker (🆕)
- `GET /api/shark-tracker/signals` - Get recent shark signals
- `GET /api/shark-tracker/analyze/:symbol` - Analyze single stock
- `POST /api/shark-tracker/batch-analyze` - Analyze multiple stocks
- `GET /api/shark-tracker/dashboard` - Dashboard data với icons

### Price History
- `GET /api/prices/:symbol` - Get price history
- `POST /api/prices/batch` - Batch insert (n8n webhook)
- `GET /api/prices/:symbol/latest` - Latest price

### Trading Rules
- `GET /api/trading-rules` - Get current rules
- `PUT /api/trading-rules` - Update rules

---

## NEXT STEPS

### Immediate Actions:
1. ✅ Review và approve plan này
2. → **Phase 0**: Setup Cloudflare infrastructure
   - Install Wrangler CLI
   - Create D1 database
   - Setup Workers project
3. → **Phase 1**: Xây dựng data models & types
   - Mở rộng `types.ts` với Shark Tracker types
   - Tạo D1 service layer
4. → **Phase 2**: Implement core services
   - Volume Analysis Service
   - Shark Tracker Service
   - Trading Rules Service

### Development Workflow:
```
1. Setup Cloudflare (Phase 0) → 1 day
2. Database Schema + Types (Phase 1) → 2 days
3. Core Services (Phase 2) → 5-7 days
4. Strategy & Alerts (Phase 3) → 3-4 days
5. Testing & Polish (Phase 4) → 2-3 days
─────────────────────────────────────────
Total: ~2-3 weeks for MVP
```

---

*Document này sẽ được cập nhật khi có thay đổi về requirements hoặc architecture.*
*Last Updated: 2026-01-13 - Added VSA/Shark Tracker & Cloudflare D1 integration*
