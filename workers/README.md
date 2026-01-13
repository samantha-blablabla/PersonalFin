# FinTrack Pro VN - Cloudflare Workers API

Backend API powered by Cloudflare Workers và D1 Database.

## Prerequisites

- Node.js 18+ installed
- Cloudflare account (free tier OK)
- Wrangler CLI installed globally

## Setup Instructions

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Get Your Account ID

```bash
wrangler whoami
```

Copy your Account ID và update trong `wrangler.toml`:

```toml
account_id = "your_account_id_here"
```

### 4. Create D1 Database

```bash
wrangler d1 create fintrack-db
```

Lưu ý output chứa `database_id`. Update vào `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "fintrack-db"
database_id = "your_database_id_here"  # Replace this
```

### 5. Apply Database Schema

```bash
wrangler d1 execute fintrack-db --file=workers/db/schema.sql
```

### 6. Setup Environment Variables

Copy file mẫu:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` và điền API keys:

```
GEMINI_API_KEY=your_actual_key_here
ALLOWED_ORIGINS=http://localhost:5173
```

### 7. Test Locally

```bash
wrangler dev
```

API sẽ chạy tại: `http://localhost:8787`

### 8. Deploy to Cloudflare

```bash
wrangler deploy
```

## API Endpoints

### Health Check
- `GET /` - API info
- `GET /health` - Health status

### Transactions (Coming Soon)
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction

### Investments (Coming Soon)
- `GET /api/investments` - List investments
- `POST /api/investments` - Add investment

### Shark Tracker (Coming Soon)
- `GET /api/shark-tracker/signals` - Get shark signals
- `POST /api/shark-tracker/batch-analyze` - Analyze stocks

## Database Schema

7 tables:
- `transactions` - Thu/chi
- `investments` - Danh mục
- `goals` - Mục tiêu
- `watchlist` - Theo dõi
- `price_history` - Lịch sử giá (OHLCV)
- `shark_signals` - VSA tracking
- `trading_rules` - Config

See: `workers/db/schema.sql`

## Development

### Query D1 Database Locally

```bash
# List all tables
wrangler d1 execute fintrack-db --command "SELECT name FROM sqlite_master WHERE type='table';"

# Query data
wrangler d1 execute fintrack-db --command "SELECT * FROM transactions LIMIT 10;"
```

### Reset Database (Development Only)

```bash
# Drop all tables and recreate
wrangler d1 execute fintrack-db --file=workers/db/schema.sql
```

## Project Structure

```
workers/
├── api/
│   ├── index.ts              # Entry point
│   ├── routes.ts             # Route definitions
│   └── middleware/
│       ├── cors.ts           # CORS handling
│       └── errorHandler.ts   # Error responses
├── handlers/
│   ├── transactions.ts       # (To be implemented)
│   ├── investments.ts        # (To be implemented)
│   └── sharkTracker.ts       # (To be implemented)
└── db/
    ├── schema.sql            # Database schema
    └── migrations/           # Future migrations
```

## Next Steps

1. Implement handlers for each endpoint
2. Build D1 service wrapper (services/core/d1Service.ts)
3. Implement business logic services
4. Add authentication middleware
5. Setup n8n workflows for price crawling

## Troubleshooting

### Error: "Database not found"
- Make sure you created D1 database: `wrangler d1 create fintrack-db`
- Update `database_id` in wrangler.toml

### Error: "Cannot find module"
- Run `npm install` in project root

### CORS errors
- Check `ALLOWED_ORIGINS` in .dev.vars
- Make sure frontend URL is included

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
