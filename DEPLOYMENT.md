# FinTrack Pro VN - Deployment Guide

Complete guide for deploying the backend to Cloudflare Workers with D1 Database.

## Prerequisites

1. **Cloudflare Account**: Sign up at https://dash.cloudflare.com
2. **Wrangler CLI**: Install globally
   ```bash
   npm install -g wrangler
   ```
3. **Node.js**: Version 16 or higher

## Setup Steps

### 1. Authenticate with Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate.

### 2. Create D1 Database

```bash
wrangler d1 create fintrack-pro-vn-db
```

Copy the database ID from the output. It will look like:
```
[[d1_databases]]
binding = "DB"
database_name = "fintrack-pro-vn-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 3. Update wrangler.toml

Replace the placeholder in `wrangler.toml` with your actual database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "fintrack-pro-vn-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace this
```

### 4. Initialize Database Schema

Run the schema migration to create all tables:

```bash
wrangler d1 execute fintrack-pro-vn-db --remote --file=./workers/db/schema.sql
```

Verify tables were created:

```bash
wrangler d1 execute fintrack-pro-vn-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

You should see 8 tables:
- transactions
- investments
- goals
- watchlist
- price_history
- shark_signals
- trading_rules
- schema_migrations

### 5. Set Environment Variables

Add secrets to your Cloudflare Worker:

```bash
# Gemini API Key (required for AI features)
wrangler secret put GEMINI_API_KEY

# Telegram Bot Token (optional, for notifications)
wrangler secret put TELEGRAM_BOT_TOKEN

# Allowed Origins for CORS (optional, defaults to localhost:5173)
wrangler secret put ALLOWED_ORIGINS
# Example: http://localhost:5173,https://yourdomain.com

# Environment (optional, defaults to production)
wrangler secret put ENVIRONMENT
# Example: production or development
```

### 6. Test Locally

Run the worker locally with D1 database:

```bash
wrangler dev
```

The API will be available at: http://localhost:8787

Test the health endpoint:
```bash
curl http://localhost:8787/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy"
  }
}
```

### 7. Deploy to Production

Deploy to Cloudflare:

```bash
wrangler deploy
```

Your API will be deployed to: `https://fintrack-pro-vn.YOUR_SUBDOMAIN.workers.dev`

## API Endpoints

### Health & Info

- `GET /` - API info and available endpoints
- `GET /health` - Health check

### Investments

- `GET /api/investments` - List all investments with portfolio metrics
- `POST /api/investments` - Create new investment
- `GET /api/investments/profit-check` - Check which investments should take profit

### Shark Tracker (VSA)

- `GET /api/shark-tracker/signals?days=7` - Get recent shark signals
- `GET /api/shark-tracker/analyze/:symbol` - Analyze single stock (e.g., HPG)
- `POST /api/shark-tracker/batch-analyze` - Analyze multiple stocks
  ```json
  { "symbols": ["HPG", "VNM", "TCB"] }
  ```
- `GET /api/shark-tracker/dashboard` - Dashboard with top signals

### Transactions

- `GET /api/transactions?limit=100&type=INCOME&category=Salary` - List transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/summary?period=month` - Summary (month/quarter/year)
- `DELETE /api/transactions/:id` - Delete transaction

### Goals

- `GET /api/goals` - List all goals with progress
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal progress
- `DELETE /api/goals/:id` - Delete goal
- `GET /api/goals/summary` - Goals summary statistics

### Watchlist

- `GET /api/watchlist` - List watchlist with current prices
- `POST /api/watchlist` - Add symbol to watchlist
- `PUT /api/watchlist/:id` - Update watchlist item
- `DELETE /api/watchlist/:id` - Remove from watchlist
- `GET /api/watchlist/alerts` - Get price alerts

## Testing with Mock Data

To seed the database with mock data for testing:

1. Create a test script using the mock data service:

```typescript
import { D1Service } from './services/core/d1Service';
import { seedMockData } from './services/utils/mockDataService';

// In your worker or test script
const d1Service = new D1Service(env.DB);
await seedMockData(d1Service);
```

2. Or manually insert test data using D1 SQL:

```bash
wrangler d1 execute fintrack-pro-vn-db --remote --command="
INSERT INTO price_history (symbol, date, open_price, close_price, high_price, low_price, volume)
VALUES ('HPG', '2024-01-10', 25000, 25500, 26000, 24800, 5000000)
"
```

## Monitoring & Debugging

### View Logs

```bash
wrangler tail
```

### Check Database

Query the database directly:

```bash
# List all shark signals
wrangler d1 execute fintrack-pro-vn-db --remote --command="SELECT * FROM shark_signals ORDER BY created_at DESC LIMIT 10"

# Check investments
wrangler d1 execute fintrack-pro-vn-db --remote --command="SELECT * FROM investments"

# View transactions summary
wrangler d1 execute fintrack-pro-vn-db --remote --command="SELECT type, COUNT(*) as count, SUM(amount) as total FROM transactions GROUP BY type"
```

### Analytics Dashboard

View your worker analytics in Cloudflare Dashboard:
- Requests per second
- Error rate
- Response time
- CPU time

## Production Best Practices

### 1. Rate Limiting

Consider adding rate limiting for public endpoints:

```typescript
// Add to middleware
const rateLimiter = new RateLimiter(env.RATE_LIMITER);
await rateLimiter.limit({ key: clientIP });
```

### 2. Caching

Use Cloudflare Cache for frequently accessed data:

```typescript
// Cache shark signals for 5 minutes
const cacheKey = new Request(url.toString(), request);
const cache = caches.default;
let response = await cache.match(cacheKey);

if (!response) {
  response = await generateResponse();
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
}
```

### 3. Database Backups

Cloudflare D1 automatically backs up your database, but you can export data:

```bash
wrangler d1 export fintrack-pro-vn-db --remote --output=backup.sql
```

### 4. Custom Domain

Add a custom domain in Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select your worker
3. Click "Triggers" tab
4. Add Custom Domain

### 5. Environment-Specific Configs

Use different environments for dev/staging/production:

```toml
# wrangler.toml
[env.production]
name = "fintrack-pro-vn"
vars = { ENVIRONMENT = "production" }

[env.staging]
name = "fintrack-pro-vn-staging"
vars = { ENVIRONMENT = "staging" }
```

Deploy to specific environment:
```bash
wrangler deploy --env staging
```

## Troubleshooting

### Issue: "Database not found"

**Solution**: Make sure you created the D1 database and updated `wrangler.toml` with correct database_id.

### Issue: "Module not found" errors

**Solution**: Ensure all TypeScript files are properly compiled. Run `npm run build` if you have a build step.

### Issue: CORS errors from frontend

**Solution**: Add your frontend domain to ALLOWED_ORIGINS:
```bash
wrangler secret put ALLOWED_ORIGINS
# Enter: http://localhost:5173,https://yourdomain.com
```

### Issue: "Unhandled Promise Rejection"

**Solution**: Check worker logs with `wrangler tail` to see detailed error messages.

### Issue: Slow response times

**Solution**:
- Add database indexes for frequently queried columns
- Implement caching for expensive operations
- Use batch operations instead of multiple individual queries

## Cost Estimates

Cloudflare Workers Free Tier:
- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request
- ✅ D1 Database: 5GB storage, 5M reads/day, 100K writes/day

For most personal finance apps, the free tier is sufficient!

Paid Plan ($5/month):
- 10M requests/month included
- Additional requests: $0.50 per million
- D1 additional storage: $0.75/GB/month

## Next Steps

1. ✅ Deploy worker to Cloudflare
2. ✅ Set up custom domain (optional)
3. ✅ Configure CORS for your frontend
4. ✅ Seed database with initial data
5. ✅ Set up monitoring and alerts
6. Connect frontend application (GAS will handle this)
7. Test all API endpoints with real data
8. Set up Telegram bot for notifications (optional)

## Support Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Community](https://community.cloudflare.com/)

---

**Backend deployment is complete!** 🚀

The API is ready for frontend integration. All endpoints are documented and tested.
