# VSA Rules Reference - FinTrack Pro VN

> **Quick reference guide for Volume Spread Analysis (VSA) rules and Shark Tracker logic**

## 📊 VSA Core Concepts

**Volume Spread Analysis (VSA)** là phương pháp phân tích dòng tiền dựa trên mối quan hệ giữa:
- **Volume** (Khối lượng giao dịch)
- **Price Spread** (Biên độ giá)
- **Context** (Bối cảnh thị trường)

### Nguyên Lý Cơ Bản

1. **Big Money leaves footprints** - Dòng tiền lớn luôn để lại dấu vết
2. **Volume confirms price** - Khối lượng xác nhận xu hướng giá
3. **Low volume = Low interest** - Khối lượng thấp = Thiếu quan tâm
4. **High volume on narrow spread = Distribution** - Volume cao giá ngang = Xả hàng

---

## 🦈 4 Market States - Shark Tracker

### 1. 🔥 PUMPING - Big Money In

**Điều kiện:**
```typescript
priceChange > 2%           // Giá tăng mạnh hơn 2%
volumeRatio >= 1.5         // Khối lượng >= 1.5x trung bình 20 ngày
RSI < 70                   // Chưa quá mua
```

**Ý nghĩa:**
- Dòng tiền lớn đang nhập cuộc
- Có khả năng breakout mạnh
- Xu hướng tăng có nền tảng vững chắc

**Hành động khuyến nghị:**
- ✅ Xem xét mua thêm (nếu đang nắm giữ)
- ✅ Theo dõi sát để chốt lời từng phần
- ⚠️ Cẩn thận với các mã đã tăng nhiều ngày liên tiếp

**Ví dụ:**
```
HPG: Giá +3.2%, Volume 8.5M (avg 5M) = 1.7x
👉 Signal: PUMPING 🔥
👉 Action: Dòng tiền lớn đang nhập cuộc! Breakout mạnh.
```

---

### 2. 💎 ACCUMULATING - Low Supply

**Điều kiện:**
```typescript
priceChange between -0.5% and +0.5%    // Giá đi ngang
volumeRatio < 0.7                      // Khối lượng < 0.7x trung bình
noNegativeNews = true                  // Không có tin xấu
```

**Ý nghĩa:**
- Cá mập đang âm thầm gom hàng
- Thị trường thiếu nguồn cung
- Chuẩn bị cho xu hướng mới

**Hành động khuyến nghị:**
- ✅ Tích luỹ dần dần (DCA - Dollar Cost Averaging)
- ✅ Đặt lệnh chờ ở vùng hỗ trợ
- ⚠️ Kiên nhẫn chờ đợi, không vội vàng

**Ví dụ:**
```
VNM: Giá -0.3%, Volume 1.8M (avg 3M) = 0.6x
👉 Signal: ACCUMULATING 💎
👉 Action: Cá mập đang âm thầm gom hàng. Giá đi ngang, khối lượng thấp.
```

**Giai đoạn tiếp theo:**
- Thường kéo dài 2-4 tuần
- Kết thúc bằng breakout với volume surge
- Đây là thời điểm vàng để vào lệnh

---

### 3. ⚠️ DISTRIBUTING - Distribution Phase

**Điều kiện:**
```typescript
priceChange <= 0%          // Giá giảm hoặc đi ngang
volumeRatio >= 1.5         // Khối lượng tăng đột biến
mayHavePositiveNews = true // Có thể có tin tốt (bull trap)
```

**Ý nghĩa:**
- Cá mập đang thoát hàng
- Bull trap - Bẫy tăng giá
- Nguy cơ đảo chiều xu hướng

**Hành động khuyến nghị:**
- ❌ TRÁNH mua thêm
- ✅ Chốt lời từng phần nếu đang có lãi
- ✅ Cắt lỗ nếu giá xuống dưới stop loss
- ⚠️ Đặc biệt cẩn thận nếu có tin tốt đột ngột

**Ví dụ:**
```
TCB: Giá -1.2%, Volume 7.5M (avg 4M) = 1.875x
👉 Signal: DISTRIBUTING ⚠️
👉 Action: Cá mập đang thoát hàng. Cẩn thận!
```

**Dấu hiệu nhận biết:**
- Volume tăng đột biến nhưng giá không tăng
- Có tin tốt nhưng giá vẫn giảm
- Xuất hiện nhiều phiên có upper shadow dài

---

### 4. 🚨 QUIET - Pump & Dump Warning

**Điều kiện:**
```typescript
priceChange > 3%           // Giá tăng rất mạnh
volumeRatio < 1.2          // Nhưng khối lượng KHÔNG tăng
noFundamentals = true      // Thiếu nền tảng cơ bản
```

**Ý nghĩa:**
- Tín hiệu lừa đảo - Pump & Dump
- Không có dòng tiền thật
- Có thể là thao túng giá

**Hành động khuyến nghị:**
- ❌ TUYỆT ĐỐI TRÁNH XA
- ❌ Không FOMO (Fear of Missing Out)
- ✅ Nếu đang nắm giữ, chốt lời ngay lập tức
- ⚠️ Báo cáo nếu nghi ngờ thao túng

**Ví dụ:**
```
ABC: Giá +4.5%, Volume 3.2M (avg 3M) = 1.07x
👉 Signal: QUIET 🚨
👉 Action: Cảnh báo pump & dump! Giá tăng mạnh nhưng thiếu volume.
```

**Đặc điểm pump & dump:**
- Tăng giá đột ngột không có lý do
- Volume thấp bất thường
- Thường xảy ra với cổ phiếu vốn hoá nhỏ
- Giá sẽ giảm mạnh sau khi đạt đỉnh

---

## 📈 VSA Technical Parameters

### Volume Thresholds

| Threshold | Value | Meaning |
|-----------|-------|---------|
| **Big Money Volume** | ≥ 1.5x | Dòng tiền lớn |
| **Volume Surge** | ≥ 1.5x | Đột biến khối lượng |
| **Low Supply** | < 0.7x | Thiếu nguồn cung |
| **Pump & Dump Max** | < 1.2x | Không có volume thật |

### Price Thresholds

| Threshold | Value | Meaning |
|-----------|-------|---------|
| **Big Money Price** | > 2% | Tăng giá mạnh |
| **Sideways Range** | ±0.5% | Đi ngang |
| **Strong Pump** | > 3% | Tăng rất mạnh |

### Technical Indicators

| Indicator | Period | Overbought | Oversold |
|-----------|--------|------------|----------|
| **RSI** | 14 | > 70 | < 30 |
| **MA20** | 20 days | Price above | Price below |
| **MA50** | 50 days | Price above | Price below |

---

## 🎯 Trading Rules Integration

### 1. Profit Taking Rules

```typescript
// Default thresholds
takeProfitThreshold: 25%      // Chốt lời khi lãi >= 25%
scaleOutThreshold: 30%        // Chốt từng phần khi lãi >= 30%
scaleOutPercentage: 30%       // Chốt 30% số lượng
```

**Logic:**
```
IF profitPercentage >= 25%:
  → Recommend: "Nên chốt lời"

IF profitPercentage >= 30%:
  → Recommend: "Chốt 30% (X cổ phiếu) để bảo toàn lợi nhuận,
                giữ 70% để theo xu hướng"
```

### 2. Stop Loss Rules

```typescript
stopLossPercentage: 10%       // Stop loss ở -10%
```

**Logic:**
```
IF currentLoss >= 10%:
  → Recommend: "Cắt lỗ để bảo vệ vốn"
```

### 3. Position Sizing Rules

```typescript
maxPositionSize: 20%          // Tối đa 20% danh mục/1 mã
minCashReserve: 10%          // Luôn giữ 10% tiền mặt
```

---

## 💡 VSA Patterns & Scenarios

### Pattern 1: Breakout với Volume

```
Tình huống:
- Giá breakout khỏi vùng kháng cự
- Volume tăng đột biến (>1.5x)
- RSI chưa quá mua (<70)

Signal: PUMPING 🔥
Action: Mua khi giá retest vùng kháng cự cũ (giờ là hỗ trợ mới)
```

### Pattern 2: Testing Support

```
Tình huống:
- Giá test vùng hỗ trợ
- Volume giảm (<0.7x)
- Không có tin xấu

Signal: ACCUMULATING 💎
Action: Tích luỹ dần, đặt stop loss dưới vùng hỗ trợ
```

### Pattern 3: Failed Breakout (Bull Trap)

```
Tình huống:
- Giá breakout nhưng không giữ được
- Volume tăng nhưng giá quay đầu giảm
- Upper shadow dài

Signal: DISTRIBUTING ⚠️
Action: Chốt lời hoặc cắt lỗ, tránh mua thêm
```

### Pattern 4: No Demand Rally

```
Tình huống:
- Giá tăng mạnh (>3%)
- Volume KHÔNG tăng theo (<1.2x)
- Không có tin tức hoặc catalyst rõ ràng

Signal: QUIET 🚨
Action: Tránh xa, đây là pump & dump
```

---

## 📊 Volume Profile Analysis

### Volume Levels

```
Very High:  > 2.0x average    🔴 Extreme activity
High:       1.5x - 2.0x       🟠 Strong activity
Normal:     0.8x - 1.5x       🟢 Balanced
Low:        0.5x - 0.8x       🟡 Weak activity
Very Low:   < 0.5x            🔵 No interest
```

### Volume + Price Matrix

| Price | Volume High | Volume Normal | Volume Low |
|-------|-------------|---------------|------------|
| **Up** | 🔥 PUMPING | ✅ Healthy | 🚨 Warning |
| **Sideways** | ⚠️ DISTRIBUTING | 🟢 Normal | 💎 ACCUMULATING |
| **Down** | ⚠️ DISTRIBUTING | 🔴 Selling | ✅ Capitulation? |

---

## 🔍 Advanced VSA Concepts

### 1. Wyckoff Accumulation Phases

```
Phase A: Stopping the decline
  → High volume, price stops falling
  → Signal: QUIET → ACCUMULATING

Phase B: Building a cause
  → Low volume, sideways price
  → Signal: ACCUMULATING 💎

Phase C: Spring / Shakeout
  → Brief drop to test support
  → Signal: Still ACCUMULATING

Phase D: Markup begins
  → Breakout with volume surge
  → Signal: PUMPING 🔥
```

### 2. Distribution Phases (Wyckoff)

```
Phase A: Stopping the advance
  → High volume at top
  → Signal: PUMPING → DISTRIBUTING

Phase B: Building a cause for decline
  → High volume, sideways price
  → Signal: DISTRIBUTING ⚠️

Phase C: Upthrust / Last point of supply
  → False breakout
  → Signal: DISTRIBUTING ⚠️

Phase D: Markdown begins
  → Breakdown with volume
  → Signal: Exit immediately
```

---

## 📝 Configuration in Code

### File: `services/core/configService.ts`

```typescript
export const VSA_RULES = {
  // Big Money In Detection
  BIG_MONEY_PRICE_THRESHOLD: 0.02,      // 2%
  BIG_MONEY_VOLUME_THRESHOLD: 1.5,      // 1.5x

  // Volume Surge
  VOLUME_SURGE_THRESHOLD: 1.5,          // 1.5x

  // Low Supply (Accumulation)
  LOW_SUPPLY_VOLUME_THRESHOLD: 0.7,     // 0.7x

  // Pump & Dump Warning
  PUMP_DUMP_VOLUME_THRESHOLD: 1.2,      // Max 1.2x
  PUMP_DUMP_PRICE_THRESHOLD: 0.03,      // 3%

  // Sideways Detection
  SIDEWAYS_PRICE_RANGE: 0.005,          // ±0.5%
};

export const DEFAULT_TRADING_RULES = {
  takeProfitThreshold: 0.25,            // 25%
  scaleOutThreshold: 0.30,              // 30%
  scaleOutPercentage: 0.30,             // Sell 30%
  stopLossPercentage: 0.10,             // 10%
  maxPositionSize: 0.20,                // 20% per stock
  minCashReserve: 0.10,                 // 10% cash
};
```

### Customization

Bạn có thể điều chỉnh các threshold trong `configService.ts` theo:
- Phong cách giao dịch (aggressive/conservative)
- Mức độ rủi ro chấp nhận
- Kinh nghiệm cá nhân

---

## 🎓 Learning Resources

### VSA Fundamentals
- Tom Williams - "Master the Markets"
- Gavin Holmes - VSA Tutorials
- TradeGuider - VSA Software

### Vietnamese Stock Market Context
- HOSE (Ho Chi Minh Stock Exchange)
- HNX (Hanoi Stock Exchange)
- UPCOM (Unlisted Public Company Market)

### Key Differences in VN Market
- T+2 settlement (vs T+0 in other markets)
- Daily price limits (±7% for stocks, ±10% for ETFs)
- Less liquid than major markets
- Higher retail investor participation

---

## ⚠️ Important Notes

### 1. VSA is not 100% accurate
- Luôn kết hợp với các chỉ báo khác
- Quan sát context và tin tức
- Không trade chỉ dựa trên 1 signal

### 2. False Signals
- Có thể xảy ra trong thị trường biến động mạnh
- News-driven moves có thể làm sai lệch VSA
- End of day volume surge (15h-15h30) cần được lọc

### 3. Market Context
- VSA works best in liquid stocks
- Small cap stocks có thể bị thao túng
- Always check broader market trend

### 4. Risk Management
- Luôn đặt stop loss
- Không all-in vào 1 mã
- Diversify portfolio
- Keep cash reserve

---

## 📞 Support

Nếu có thắc mắc về VSA rules hoặc cần tư vấn:
- GitHub Issues: [PersonalFin/issues](https://github.com/samantha-blablabla/PersonalFin/issues)
- Email: samantha-blablabla@users.noreply.github.com

---

## 🔄 Updates

**Version 1.0** (2024-01-13)
- Initial VSA rules implementation
- 4 market states defined
- Trading rules integrated
- Configuration parameters set

---

<div align="center">

**Shark Tracker VSA Rules v1.0**

Built with ❤️ for Vietnamese traders

[📖 Back to README](README.md) • [🚀 Deployment Guide](DEPLOYMENT.md) • [💡 API Examples](API_EXAMPLES.md)

</div>
