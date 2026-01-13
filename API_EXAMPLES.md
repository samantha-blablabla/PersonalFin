# API Examples - FinTrack Pro VN

Complete examples for testing all API endpoints with real request/response data.

## Table of Contents
- [Authentication & Setup](#authentication--setup)
- [Shark Tracker APIs](#shark-tracker-apis)
- [Investments APIs](#investments-apis)
- [Transactions APIs](#transactions-apis)
- [Goals APIs](#goals-apis)
- [Watchlist APIs](#watchlist-apis)

---

## Authentication & Setup

Base URL (local): `http://localhost:8787`
Base URL (production): `https://fintrack-pro-vn.YOUR_SUBDOMAIN.workers.dev`

Headers for all requests:
```bash
Content-Type: application/json
Origin: http://localhost:5173  # Your frontend domain
```

---

## Shark Tracker APIs

### 1. Get Recent Shark Signals

**Request:**
```bash
curl -X GET "http://localhost:8787/api/shark-tracker/signals?days=7" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "symbol": "HPG",
      "date": "2024-01-10",
      "status": "PUMPING",
      "avgVolume20d": 5000000,
      "currentVolume": 8500000,
      "volumeRatio": 1.7,
      "priceChange": 3.2,
      "signalDescription": "Dòng tiền lớn đang nhập cuộc! Breakout mạnh.",
      "signalIcon": "🔥",
      "createdAt": "2024-01-10T09:30:00Z"
    },
    {
      "id": 2,
      "symbol": "VNM",
      "date": "2024-01-10",
      "status": "ACCUMULATING",
      "avgVolume20d": 3000000,
      "currentVolume": 1800000,
      "volumeRatio": 0.6,
      "priceChange": -0.3,
      "signalDescription": "Cá mập đang âm thầm gom hàng. Giá đi ngang, khối lượng thấp.",
      "signalIcon": "💎",
      "createdAt": "2024-01-10T09:30:00Z"
    }
  ]
}
```

### 2. Analyze Single Symbol

**Request:**
```bash
curl -X GET "http://localhost:8787/api/shark-tracker/analyze/HPG" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "HPG",
    "date": "2024-01-10",
    "status": "PUMPING",
    "avgVolume20d": 5234567,
    "currentVolume": 9123456,
    "volumeRatio": 1.74,
    "priceChange": 3.45,
    "signalDescription": "Dòng tiền lớn đang nhập cuộc! Breakout mạnh.",
    "signalIcon": "🔥"
  }
}
```

### 3. Batch Analyze Multiple Symbols

**Request:**
```bash
curl -X POST "http://localhost:8787/api/shark-tracker/batch-analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["HPG", "VNM", "TCB", "VCB", "CTR"]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analyzed": 5,
    "signals": [
      {
        "symbol": "HPG",
        "status": "PUMPING",
        "volumeRatio": 1.74,
        "priceChange": 3.45
      },
      {
        "symbol": "VNM",
        "status": "ACCUMULATING",
        "volumeRatio": 0.58,
        "priceChange": -0.32
      }
    ]
  }
}
```

### 4. Get Dashboard Data

**Request:**
```bash
curl -X GET "http://localhost:8787/api/shark-tracker/dashboard" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSignals": 48,
    "byStatus": {
      "ACCUMULATING": 12,
      "PUMPING": 8,
      "DISTRIBUTING": 5,
      "QUIET": 23
    },
    "topSignals": [
      {
        "symbol": "HPG",
        "volumeRatio": 2.1,
        "priceChange": 4.2,
        "status": "PUMPING"
      }
    ],
    "recentSignals": [...]
  }
}
```

---

## Investments APIs

### 1. Get All Investments

**Request:**
```bash
curl -X GET "http://localhost:8787/api/investments" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "investments": [
      {
        "id": "inv_001",
        "symbol": "HPG",
        "type": "STOCK",
        "quantity": 1000,
        "avgPrice": 24500,
        "currentPrice": 27150,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "metrics": {
      "totalInvested": 24500000,
      "currentValue": 27150000,
      "totalProfit": 2650000,
      "totalProfitPercentage": 10.82,
      "numberOfInvestments": 1
    }
  }
}
```

### 2. Create New Investment

**Request:**
```bash
curl -X POST "http://localhost:8787/api/investments" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "VNM",
    "type": "STOCK",
    "quantity": 500,
    "avgPrice": 85000,
    "currentPrice": 87000
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "inv_002",
    "symbol": "VNM",
    "type": "STOCK",
    "quantity": 500,
    "avgPrice": 85000,
    "currentPrice": 87000,
    "createdAt": "2024-01-10T10:30:00Z"
  }
}
```

### 3. Check Profit Thresholds

**Request:**
```bash
curl -X GET "http://localhost:8787/api/investments/profit-check" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "shouldTakeProfit": 2,
    "recommendations": [
      {
        "investment": {
          "id": "inv_001",
          "symbol": "HPG",
          "quantity": 1000,
          "avgPrice": 24500,
          "currentPrice": 31500
        },
        "profitCheck": {
          "shouldTakeProfit": true,
          "profitPercentage": 28.57,
          "currentValue": 31500000,
          "investedValue": 24500000,
          "profitAmount": 7000000
        },
        "recommendation": "Chốt lời HPG: Lãi 28.57% (7,000,000 VND). Khuyến nghị: Chốt 30% (300 cổ phiếu) để bảo toàn lợi nhuận, giữ 70% để theo xu hướng."
      }
    ]
  }
}
```

---

## Transactions APIs

### 1. Get All Transactions

**Request:**
```bash
curl -X GET "http://localhost:8787/api/transactions?limit=50&type=INCOME" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "txn_001",
      "type": "INCOME",
      "category": "Lương",
      "amount": 15000000,
      "description": "Lương tháng 1",
      "date": "2024-01-05",
      "createdAt": "2024-01-05T08:00:00Z"
    },
    {
      "id": "txn_002",
      "type": "EXPENSE",
      "category": "Ăn uống",
      "amount": 2000000,
      "description": "Chi tiêu hàng ngày",
      "date": "2024-01-08",
      "createdAt": "2024-01-08T19:00:00Z"
    }
  ]
}
```

### 2. Create Transaction

**Request:**
```bash
curl -X POST "http://localhost:8787/api/transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "EXPENSE",
    "category": "Đầu tư",
    "amount": 10000000,
    "description": "Mua cổ phiếu HPG",
    "date": "2024-01-10"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "txn_003",
    "type": "EXPENSE",
    "category": "Đầu tư",
    "amount": 10000000,
    "description": "Mua cổ phiếu HPG",
    "date": "2024-01-10",
    "createdAt": "2024-01-10T10:45:00Z"
  }
}
```

### 3. Get Transaction Summary

**Request:**
```bash
curl -X GET "http://localhost:8787/api/transactions/summary?period=month" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "startDate": "2024-01-01",
    "endDate": "2024-01-10",
    "totalIncome": 15000000,
    "totalExpense": 8000000,
    "netCashFlow": 7000000,
    "transactionCount": 12,
    "byCategory": {
      "Lương": 15000000,
      "Ăn uống": 2000000,
      "Đầu tư": 10000000,
      "Giải trí": 1500000
    }
  }
}
```

### 4. Delete Transaction

**Request:**
```bash
curl -X DELETE "http://localhost:8787/api/transactions/txn_003" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Transaction deleted successfully"
  }
}
```

---

## Goals APIs

### 1. Get All Goals

**Request:**
```bash
curl -X GET "http://localhost:8787/api/goals" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "goal_001",
      "name": "Quỹ khẩn cấp",
      "targetAmount": 50000000,
      "currentAmount": 30000000,
      "targetDate": "2024-12-31",
      "category": "EMERGENCY_FUND",
      "createdAt": "2024-01-01T00:00:00Z",
      "progress": 60.0,
      "remaining": 20000000,
      "daysRemaining": 355,
      "isCompleted": false,
      "isOverdue": false
    },
    {
      "id": "goal_002",
      "name": "Mua nhà",
      "targetAmount": 500000000,
      "currentAmount": 120000000,
      "targetDate": "2025-12-31",
      "category": "HOUSE",
      "createdAt": "2024-01-01T00:00:00Z",
      "progress": 24.0,
      "remaining": 380000000,
      "daysRemaining": 720,
      "isCompleted": false,
      "isOverdue": false
    }
  ]
}
```

### 2. Create Goal

**Request:**
```bash
curl -X POST "http://localhost:8787/api/goals" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Du lịch Nhật Bản",
    "targetAmount": 30000000,
    "currentAmount": 5000000,
    "targetDate": "2024-06-30",
    "category": "TRAVEL"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "goal_003",
    "name": "Du lịch Nhật Bản",
    "targetAmount": 30000000,
    "currentAmount": 5000000,
    "targetDate": "2024-06-30",
    "category": "TRAVEL",
    "createdAt": "2024-01-10T11:00:00Z"
  }
}
```

### 3. Update Goal Progress

**Request:**
```bash
curl -X PUT "http://localhost:8787/api/goals/goal_003" \
  -H "Content-Type: application/json" \
  -d '{
    "currentAmount": 10000000
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "goal_003",
    "name": "Du lịch Nhật Bản",
    "targetAmount": 30000000,
    "currentAmount": 10000000,
    "targetDate": "2024-06-30",
    "category": "TRAVEL",
    "updatedAt": "2024-01-10T11:15:00Z"
  }
}
```

### 4. Get Goals Summary

**Request:**
```bash
curl -X GET "http://localhost:8787/api/goals/summary" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalGoals": 3,
    "completedGoals": 0,
    "activeGoals": 3,
    "overdueGoals": 0,
    "totalTarget": 580000000,
    "totalSaved": 165000000,
    "totalRemaining": 415000000,
    "overallProgress": 28.45,
    "completionRate": 0.0
  }
}
```

### 5. Delete Goal

**Request:**
```bash
curl -X DELETE "http://localhost:8787/api/goals/goal_003" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Goal deleted successfully"
  }
}
```

---

## Watchlist APIs

### 1. Get Watchlist

**Request:**
```bash
curl -X GET "http://localhost:8787/api/watchlist" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "watch_001",
      "symbol": "FPT",
      "targetPrice": 90000,
      "stopLoss": 75000,
      "notes": "Chờ breakout khỏi vùng kháng cự",
      "currentPrice": 82000,
      "targetDifference": 9.76,
      "isPriceAlert": false,
      "createdAt": "2024-01-05T00:00:00Z"
    },
    {
      "id": "watch_002",
      "symbol": "MBB",
      "targetPrice": 28000,
      "stopLoss": 23000,
      "notes": "Đang tích luỹ",
      "currentPrice": 24500,
      "targetDifference": 14.29,
      "isPriceAlert": false,
      "createdAt": "2024-01-08T00:00:00Z"
    }
  ]
}
```

### 2. Add to Watchlist

**Request:**
```bash
curl -X POST "http://localhost:8787/api/watchlist" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "SSI",
    "targetPrice": 45000,
    "stopLoss": 38000,
    "notes": "Theo dõi xu hướng tăng"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "watch_003",
    "symbol": "SSI",
    "targetPrice": 45000,
    "stopLoss": 38000,
    "notes": "Theo dõi xu hướng tăng",
    "createdAt": "2024-01-10T11:30:00Z"
  }
}
```

### 3. Update Watchlist Item

**Request:**
```bash
curl -X PUT "http://localhost:8787/api/watchlist/watch_003" \
  -H "Content-Type: application/json" \
  -d '{
    "targetPrice": 48000,
    "stopLoss": 39000,
    "notes": "Tăng target price sau khi phá vùng kháng cự"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "watch_003",
    "symbol": "SSI",
    "targetPrice": 48000,
    "stopLoss": 39000,
    "notes": "Tăng target price sau khi phá vùng kháng cự",
    "updatedAt": "2024-01-10T11:45:00Z"
  }
}
```

### 4. Get Price Alerts

**Request:**
```bash
curl -X GET "http://localhost:8787/api/watchlist/alerts" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAlerts": 2,
    "alerts": [
      {
        "item": {
          "id": "watch_001",
          "symbol": "FPT",
          "targetPrice": 90000,
          "stopLoss": 75000
        },
        "currentPrice": 91000,
        "alertType": "TARGET_REACHED",
        "alertMessage": "FPT đã đạt mục tiêu 90,000 VND (hiện tại: 91,000 VND)"
      },
      {
        "item": {
          "id": "watch_004",
          "symbol": "VIC",
          "targetPrice": 50000,
          "stopLoss": 42000
        },
        "currentPrice": 41500,
        "alertType": "STOP_LOSS_HIT",
        "alertMessage": "VIC đã chạm stop loss 42,000 VND (hiện tại: 41,500 VND)"
      }
    ]
  }
}
```

### 5. Remove from Watchlist

**Request:**
```bash
curl -X DELETE "http://localhost:8787/api/watchlist/watch_003" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Removed from watchlist successfully"
  }
}
```

---

## Error Responses

All endpoints return consistent error format:

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "errors": [
      "Mã cổ phiếu phải là 3 chữ cái IN HOA",
      "Số lượng phải lớn hơn 0"
    ]
  }
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Not Found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error",
  "details": {
    "message": "Database connection failed"
  }
}
```

---

## Testing Tips

### 1. Test Locally with wrangler dev

```bash
# Start local server
wrangler dev

# Test in another terminal
curl http://localhost:8787/health
```

### 2. Use Postman Collection

Import these endpoints into Postman for easier testing:
- Set base URL as environment variable
- Save common headers
- Create test suites

### 3. Automated Testing Script

```bash
#!/bin/bash
BASE_URL="http://localhost:8787"

# Test health
echo "Testing health endpoint..."
curl -s "$BASE_URL/health" | jq

# Test shark tracker
echo "Testing shark tracker..."
curl -s "$BASE_URL/api/shark-tracker/signals?days=7" | jq

# Test investments
echo "Testing investments..."
curl -s "$BASE_URL/api/investments" | jq
```

### 4. Frontend Integration Example (React)

```typescript
// services/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export async function getSharkSignals(days: number = 7) {
  const response = await fetch(`${API_BASE}/api/shark-tracker/signals?days=${days}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}

export async function createInvestment(investment: Investment) {
  const response = await fetch(`${API_BASE}/api/investments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(investment),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
}
```

---

**All API endpoints tested and ready for integration!** 🚀
