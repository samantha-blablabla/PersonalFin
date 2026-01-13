# FinTrack Pro VN 🇻🇳

> **Hệ thống quản lý tài chính cá nhân với tính năng Shark Tracker (VSA) thông minh cho thị trường chứng khoán Việt Nam**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![D1 Database](https://img.shields.io/badge/Database-D1-F38020?style=flat)](https://developers.cloudflare.com/d1/)

## 📋 Tổng Quan

FinTrack Pro VN là một ứng dụng quản lý tài chính cá nhân toàn diện với tính năng phân tích chứng khoán thông minh dựa trên **Volume Spread Analysis (VSA)** - công nghệ phát hiện "dấu chân cá mập" trong thị trường.

### ✨ Tính Năng Chính

#### 🦈 Shark Tracker - Phát Hiện Dòng Tiền Thông Minh
- **Big Money In**: Phát hiện dòng tiền lớn đang nhập cuộc (giá tăng >2%, khối lượng >1.5x)
- **Distribution**: Cảnh báo cá mập đang thoát hàng (giá giảm + khối lượng đột biến)
- **Accumulation**: Nhận diện giai đoạn gom hàng âm thầm (giá đi ngang, khối lượng thấp)
- **Pump & Dump**: Cảnh báo tín hiệu lừa đảo (giá tăng mạnh nhưng không có khối lượng)

#### 💰 Quản Lý Đầu Tư
- Portfolio tracking với tính toán P/L realtime
- Khuyến nghị chốt lời thông minh (25% threshold)
- Scaling out tự động (chốt 30% khi lãi >30%)
- Rebalancing portfolio theo tỷ trọng mục tiêu
- Diversification score (Herfindahl Index)

#### 📊 Chỉ Báo Kỹ Thuật
- RSI (Relative Strength Index) - 14 periods
- Moving Averages (MA20, MA50)
- Golden Cross / Death Cross detection
- Overbought/Oversold warnings

#### 💵 Quản Lý Tài Chính Cá Nhân
- Thu chi hàng ngày với phân loại chi tiết
- Mục tiêu tài chính với tracking tự động
- FIRE calculator (Financial Independence, Retire Early)
- Emergency fund recommendations
- Cash flow analysis

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16
- Cloudflare account
- Wrangler CLI: `npm install -g wrangler`

### Installation

```bash
# 1. Clone repository
git clone https://github.com/samantha-blablabla/PersonalFin.git
cd PersonalFin

# 2. Create D1 database
wrangler d1 create fintrack-pro-vn-db

# 3. Update wrangler.toml với database ID từ step 2

# 4. Initialize database schema
wrangler d1 execute fintrack-pro-vn-db --remote --file=./workers/db/schema.sql

# 5. Set environment secrets
wrangler secret put GEMINI_API_KEY
wrangler secret put ALLOWED_ORIGINS

# 6. Test locally
wrangler dev

# 7. Deploy to production
wrangler deploy
```

**📖 Hướng dẫn chi tiết: [DEPLOYMENT.md](DEPLOYMENT.md)**

---

## 📡 API Endpoints

### Shark Tracker (4 endpoints)
```bash
GET  /api/shark-tracker/signals?days=7
GET  /api/shark-tracker/analyze/:symbol
POST /api/shark-tracker/batch-analyze
GET  /api/shark-tracker/dashboard
```

### Investments (3 endpoints)
```bash
GET  /api/investments
POST /api/investments
GET  /api/investments/profit-check
```

### Transactions (4 endpoints)
```bash
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/summary?period=month
DELETE /api/transactions/:id
```

### Goals (5 endpoints)
```bash
GET    /api/goals
POST   /api/goals
PUT    /api/goals/:id
DELETE /api/goals/:id
GET    /api/goals/summary
```

### Watchlist (5 endpoints)
```bash
GET    /api/watchlist
POST   /api/watchlist
PUT    /api/watchlist/:id
DELETE /api/watchlist/:id
GET    /api/watchlist/alerts
```

**📖 API Examples: [API_EXAMPLES.md](API_EXAMPLES.md)**

---

## 🏗️ Kiến Trúc

```
Frontend (React) → Cloudflare Workers API → D1 Database
                         ↓
                  Services Layer
                  (15 services, 4,500+ LOC)
```

### Services Layer

- **Core**: D1Service, ConfigService
- **Trading**: VSA, Shark Tracker, Technical Indicators, Trading Rules, Rebalancing
- **Utils**: Calculators, Validators, Mock Data

**📖 Architecture: [BACKEND_PLAN.md](BACKEND_PLAN.md)**

---

## 💡 VSA Logic

### 4 Market States

| State | Icon | Điều Kiện | Ý Nghĩa |
|-------|------|-----------|---------|
| **PUMPING** | 🔥 | Giá +2%, Vol >1.5x | Dòng tiền lớn nhập cuộc |
| **ACCUMULATING** | 💎 | Giá ngang, Vol <0.7x | Cá mập gom hàng âm thầm |
| **DISTRIBUTING** | ⚠️ | Giá giảm, Vol surge | Cá mập đang thoát hàng |
| **QUIET** | 🦈 | Giá +3%, Vol <1.2x | Pump & Dump warning |

---

## 🧪 Testing

```bash
# Start dev server
wrangler dev

# Test endpoints
curl http://localhost:8787/health
curl http://localhost:8787/api/shark-tracker/signals?days=7
curl http://localhost:8787/api/investments
```

---

## 📊 Database

### 8 Tables
1. transactions - Thu chi hàng ngày
2. investments - Danh mục đầu tư
3. goals - Mục tiêu tài chính
4. watchlist - Danh sách theo dõi
5. price_history - Lịch sử giá OHLCV
6. shark_signals - Tín hiệu VSA
7. trading_rules - Cấu hình giao dịch
8. schema_migrations - Version control

---

## 💰 Cost

### Cloudflare Free Tier
- ✅ 100,000 requests/day
- ✅ D1: 5GB storage, 5M reads/day
- ✅ Perfect for personal use!

---

## 📚 Documentation

- [BACKEND_PLAN.md](BACKEND_PLAN.md) - Architecture & planning
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [API_EXAMPLES.md](API_EXAMPLES.md) - API usage examples
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

---

## 🛠️ Tech Stack

- **Runtime**: Cloudflare Workers
- **Database**: D1 (SQLite)
- **Language**: TypeScript (strict)
- **Deployment**: Wrangler CLI

---

## 🎯 Roadmap

- [x] Phase 0: Infrastructure
- [x] Phase 1: Core Services
- [x] Phase 2: Trading Logic
- [x] Phase 3: Business Logic
- [x] Phase 4: Utilities
- [x] Phase 5: API Integration
- [ ] Phase 6: Frontend (GAS)
- [ ] Phase 7: Advanced Features

---

## 👥 Team

- **Backend**: Claude Sonnet 4.5
- **Frontend/UI**: GAS (Coming soon)
- **Owner**: [@samantha-blablabla](https://github.com/samantha-blablabla)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/samantha-blablabla/PersonalFin/issues)
- **Email**: samantha-blablabla@users.noreply.github.com

---

<div align="center">

**Built with ❤️ in Vietnam 🇻🇳**

**Powered by Claude Sonnet 4.5 & Cloudflare Workers**

[📖 Docs](DEPLOYMENT.md) • [🚀 Quick Start](#quick-start) • [💡 API](API_EXAMPLES.md)

⭐ Star this repo if it helped you!

</div>
