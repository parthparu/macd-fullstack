# MACD Strategy - Full Stack Application

A production-ready MACD + EMA trading strategy system with a Python FastAPI backend (yfinance data, real strategy logic from the notebook) and a React frontend with train/test split visualization.

## Project Structure

```
macd-fullstack/
  backend/
    main.py             <- FastAPI server: yfinance fetch, feature engineering, backtest
    requirements.txt    <- Python dependencies
  frontend/
    src/
      App.jsx           <- Root: state, derived values, layout composition
      styles.js         <- Global CSS string
      utils.js          <- formatCompact, presetDomain helpers
      components/
        Topbar.jsx          <- Symbol input, date pickers, mode tabs, run button
        LeftSidebar.jsx     <- Overview, strategy params, display, signal logic, indicators
        ChartShell.jsx      <- Chart header, toolbars, OHLCV bar, hover card, D3 chart
        RightSidebar.jsx    <- Signal badge, backtests, generalization, trade log
        StatusBar.jsx       <- Bottom status row
        CombinedChart.jsx   <- D3 candlestick + MACD panel (zoom/pan)
        EquityMini.jsx      <- Small equity curve SVG
        BacktestPanel.jsx   <- Stat grid + equity curve + final capital
        StatCard.jsx        <- Single metric display card
      main.jsx          <- Entry point
    index.html
    package.json
    vite.config.js      <- Proxies /api to backend
  README.md
```

## Strategy (from notebook)

The signal logic faithfully reimplements the notebook strategy:

1. **EMA Trend Filter** (`ema_signal`): All 6 candles in the window (current + 5 previous) must have Open and Close on the same side of EMA 200. Returns +1 (uptrend), -1 (downtrend), 0 otherwise.

2. **MACD Signal** (`macd_signal`):
   - Long (+1): Rolling 7-bar histogram min < -4e-6, then MACD crosses above signal from below, while both lines are negative.
   - Short (-1): Rolling 7-bar histogram max > +4e-6, then MACD crosses below signal from above, while both lines are positive.

3. **Combined Signal** (`pre_signal`): Both filters must agree. Flip-first deduplication removes the first bar of a new regime change.

4. **Exit/Position Management**: Swing high/low stop-loss over the window, TP = RR * SL distance. Commission 0.02%.

## Setup

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend exposes:
- `GET /health` - check status
- `GET /api/data?symbol=AAPL&train_start=2020-01-01&train_end=2024-12-31&test_start=2025-01-01&test_end=2026-02-28&interval=1h&rr=1.5&sw_window=8`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

Vite automatically proxies `/api` to `http://localhost:8000`.

### 3. Build for Production

```bash
cd frontend
npm run build
# Then serve the dist/ folder from the FastAPI backend or a web server
```

## Data Notes

- **1h interval**: yfinance allows up to 730 days of 1h data. For multi-year training periods, the API automatically splits fetches where needed.
- **1d interval**: Supports full date ranges from 2019 to present.
- For long train periods (2020-2024), use `interval=1d` for faster loading. The strategy logic is identical for both.
- The notebook used 1h data for the most recent ~400 days. Setting train_start=2020-01-01 with interval=1h will hit the 730-day yfinance limit; use `interval=1d` for longer periods.

## Train vs Test

The UI shows:
- **Train panel**: Backtest results on the training period (used for parameter optimization)
- **Test panel**: Out-of-sample backtest results (the real model validation)
- **Generalization panel**: Compares train vs test returns. A small delta indicates a robust strategy; a large delta may indicate overfitting.

Switch between train and test views using the tabs in the top bar.

## Features

- Real yfinance OHLCV data for any ticker
- Full strategy signal computation (EMA trend + MACD crossover + histogram filter)
- Candlestick + EMA 200 overlay + signal markers (triangles up/down)
- MACD histogram panel below price chart
- Train and test backtests with equity curves
- Trade log per period
- Generalization assessment
- FAHHHHH audio alert when bearish signal fires
- Crosshair with OHLCV tooltip
