import warnings
warnings.filterwarnings("ignore")

from datetime import datetime, timedelta
from typing import Optional
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False

try:
    from ta.trend import EMAIndicator, MACD
    from ta.volatility import AverageTrueRange
    TA_AVAILABLE = True
except ImportError:
    TA_AVAILABLE = False

app = FastAPI(title="MACD Strategy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

EMA_LEN = 200
BACKCANDLES_PREV = 5
HIST_THRESH = 4e-6
HIST_WINDOW = 7


def ema_trend_signal_vectorized(df: pd.DataFrame, backcandles_prev: int) -> pd.Series:
    n = len(df)
    signals = pd.Series(0, index=df.index, dtype=int)
    ema = df["EMA200"].values
    opens = df["Open"].values
    closes = df["Close"].values
    for i in range(backcandles_prev, n):
        if np.isnan(ema[i]):
            continue
        seg_open = opens[i - backcandles_prev: i + 1]
        seg_close = closes[i - backcandles_prev: i + 1]
        seg_ema = ema[i - backcandles_prev: i + 1]
        if np.all((seg_open > seg_ema) & (seg_close > seg_ema)):
            signals.iloc[i] = 1
        elif np.all((seg_open < seg_ema) & (seg_close < seg_ema)):
            signals.iloc[i] = -1
    return signals


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()

    ema_ind = EMAIndicator(close=out["Close"], window=EMA_LEN)
    out["EMA200"] = ema_ind.ema_indicator()

    macd_ind = MACD(close=out["Close"], window_slow=26, window_fast=12, window_sign=9)
    out["MACD"] = macd_ind.macd()
    out["MACD_signal_line"] = macd_ind.macd_signal()
    out["MACD_hist"] = macd_ind.macd_diff()

    out["ema_signal"] = ema_trend_signal_vectorized(out, BACKCANDLES_PREV)

    macd_line = out["MACD"]
    macd_sig = out["MACD_signal_line"]
    macd_hist = out["MACD_hist"]
    macd_line_prev = macd_line.shift(1)
    macd_sig_prev = macd_sig.shift(1)

    hist_below_win = macd_hist.rolling(HIST_WINDOW, min_periods=HIST_WINDOW).min() < -HIST_THRESH
    hist_above_win = macd_hist.rolling(HIST_WINDOW, min_periods=HIST_WINDOW).max() > HIST_THRESH

    bull_cross = (
        hist_below_win
        & (macd_line_prev <= macd_sig_prev)
        & (macd_line > macd_sig)
        & (macd_line < 0)
        & (macd_sig < 0)
    )
    bear_cross = (
        hist_above_win
        & (macd_line_prev >= macd_sig_prev)
        & (macd_line < macd_sig)
        & (macd_line > 0)
        & (macd_sig > 0)
    )

    out["macd_signal"] = 0
    out.loc[bull_cross, "macd_signal"] = 1
    out.loc[bear_cross, "macd_signal"] = -1

    out["pre_signal"] = 0
    out.loc[(out["ema_signal"] == 1) & (out["macd_signal"] == 1), "pre_signal"] = 1
    out.loc[(out["ema_signal"] == -1) & (out["macd_signal"] == -1), "pre_signal"] = -1

    s = out["pre_signal"].astype(int)
    prev_nz = s.replace(0, np.nan).ffill().shift(1)
    flip_first = (s != 0) & prev_nz.notna() & (s != prev_nz)
    out.loc[flip_first, "pre_signal"] = 0

    out = out.dropna().copy()
    return out


def simple_backtest(df: pd.DataFrame, rr: float = 1.5, sw_window: int = 8,
                    initial_capital: float = 100_000, commission: float = 0.0002,
                    interval: str = "1h") -> dict:
    closes = df["Close"].values
    highs = df["High"].values
    lows = df["Low"].values
    signals = df["pre_signal"].values

    capital = initial_capital
    position = None
    trades = []
    equity_curve = [{"date": df.index[0].isoformat(), "equity": capital}]
    max_eq = capital
    max_dd = 0.0

    for i in range(sw_window + 1, len(df)):
        price = closes[i]
        sig = int(signals[i])

        if position:
            pnl_pct = (price - position["entry"]) / position["entry"] * (1 if position["side"] == "long" else -1)
            target_pct = position["dist"] / position["entry"] * rr if position["dist"] else 0
            stop_pct = -position["dist"] / position["entry"] if position["dist"] else 0

            should_exit = (
                (position["side"] == "long" and pnl_pct <= stop_pct)
                or (position["side"] == "short" and pnl_pct <= stop_pct)
                or (pnl_pct >= target_pct)
                or (position["side"] == "long" and sig == -1)
                or (position["side"] == "short" and sig == 1)
            )

            if should_exit:
                fee = position["value"] * commission
                pnl = (price - position["entry"]) * position["shares"] * (1 if position["side"] == "long" else -1) - fee
                capital += position["value"] + pnl
                trades.append({
                    "entryDate": position["entryDate"].isoformat(),
                    "exitDate": df.index[i].isoformat(),
                    "side": position["side"],
                    "entryPrice": round(position["entry"], 4),
                    "exitPrice": round(price, 4),
                    "pnl": round(pnl, 2),
                    "pnlPct": round(pnl_pct * 100, 3),
                })
                position = None

        if not position and sig in (1, -1):
            side = "long" if sig == 1 else "short"
            lows_win = lows[max(0, i - sw_window): i + 1]
            highs_win = highs[max(0, i - sw_window): i + 1]
            value = capital * 0.95
            fee = value * commission
            capital -= value + fee

            if side == "long":
                sl_price = float(np.min(lows_win))
                dist = max(price - sl_price, 0.01)
            else:
                sl_price = float(np.max(highs_win))
                dist = max(sl_price - price, 0.01)

            shares = value / price
            position = {
                "side": side,
                "entry": price,
                "entryDate": df.index[i],
                "shares": shares,
                "value": value,
                "dist": dist,
            }

        eq_val = capital
        if position:
            unrealized = (price - position["entry"]) * position["shares"] * (1 if position["side"] == "long" else -1)
            eq_val = capital + position["value"] + unrealized
        equity_curve.append({"date": df.index[i].isoformat(), "equity": round(eq_val, 2)})
        if eq_val > max_eq:
            max_eq = eq_val
        dd = (max_eq - eq_val) / max_eq * 100
        if dd > max_dd:
            max_dd = dd

    if position:
        price = closes[-1]
        fee = position["value"] * commission
        pnl = (price - position["entry"]) * position["shares"] * (1 if position["side"] == "long" else -1) - fee
        capital += position["value"] + pnl
        trades.append({
            "entryDate": position["entryDate"].isoformat(),
            "exitDate": df.index[-1].isoformat(),
            "side": position["side"],
            "entryPrice": round(position["entry"], 4),
            "exitPrice": round(price, 4),
            "pnl": round(pnl, 2),
            "pnlPct": round(pnl / position["value"] * 100, 3),
        })

    wins = [t for t in trades if t["pnl"] > 0]
    losses = [t for t in trades if t["pnl"] <= 0]
    win_rate = len(wins) / len(trades) * 100 if trades else 0
    gross_win = sum(t["pnl"] for t in wins)
    gross_loss = abs(sum(t["pnl"] for t in losses))
    profit_factor = gross_win / gross_loss if gross_loss > 0 else (float("inf") if wins else 0)
    total_return = (capital - initial_capital) / initial_capital * 100

    eqs = [e["equity"] for e in equity_curve]
    rets = [(eqs[i] - eqs[i - 1]) / eqs[i - 1] for i in range(1, len(eqs))]
    mean_r = np.mean(rets) if rets else 0
    std_r = np.std(rets) if rets else 0
    bars_per_year = 252 if interval == "1d" else 252 * 7
    sharpe = (mean_r / std_r * np.sqrt(bars_per_year)) if std_r > 0 else 0

    return {
        "trades": trades,
        "equityCurve": equity_curve,
        "totalReturn": round(total_return, 3),
        "winRate": round(win_rate, 3),
        "maxDrawdown": round(max_dd, 3),
        "sharpe": round(sharpe, 3),
        "profitFactor": round(profit_factor, 3) if profit_factor != float("inf") else 999,
        "numTrades": len(trades),
        "finalEquity": round(capital, 2),
    }


def fetch_yfinance(symbol: str, start: str, end: str, interval: str = "1h") -> pd.DataFrame:
    if not YFINANCE_AVAILABLE:
        raise HTTPException(status_code=503, detail="yfinance not installed. Run: pip install yfinance")

    df = yf.download(symbol, start=start, end=end, interval=interval,
                     auto_adjust=True, progress=False, threads=False)

    if df.empty:
        df = yf.download(symbol, period="730d", interval=interval,
                         auto_adjust=True, progress=False, threads=False)

    if df.empty:
        raise HTTPException(status_code=404, detail=f"No data for {symbol}")

    # Flatten MultiIndex columns (yfinance v0.2+ always returns MultiIndex)
    if isinstance(df.columns, pd.MultiIndex):
        # Try to select the specific ticker level first
        sym_upper = symbol.upper()
        if sym_upper in df.columns.get_level_values(1):
            df = df.xs(sym_upper, axis=1, level=1)
        elif symbol in df.columns.get_level_values(1):
            df = df.xs(symbol, axis=1, level=1)
        else:
            # Fall back: just drop the ticker level
            df.columns = df.columns.get_level_values(0)

    # Normalize column names to Title Case (Open, High, Low, Close, Volume)
    df.columns = [str(c).strip().title() for c in df.columns]
    df = df.dropna()
    df.index = pd.to_datetime(df.index, utc=True)
    return df


def df_to_ohlcv_list(df: pd.DataFrame, extra_cols: list = None) -> list:
    records = []
    for idx, row in df.iterrows():
        rec = {
            "date": idx.isoformat(),
            "open": round(float(row["Open"]), 4),
            "high": round(float(row["High"]), 4),
            "low": round(float(row["Low"]), 4),
            "close": round(float(row["Close"]), 4),
            "volume": int(row.get("Volume", 0)),
        }
        if extra_cols:
            for col in extra_cols:
                if col in row:
                    val = row[col]
                    rec[col] = round(float(val), 6) if not np.isnan(float(val)) else None
        records.append(rec)
    return records


@app.get("/health")
def health():
    return {"status": "ok", "yfinance": YFINANCE_AVAILABLE, "ta": TA_AVAILABLE}


@app.get("/api/data")
def get_data(
    symbol: str = Query("AAPL", description="Ticker symbol"),
    train_start: str = Query("2020-01-01"),
    train_end: str = Query("2024-12-31"),
    test_start: str = Query("2025-01-01"),
    test_end: str = Query("2026-02-28"),
    interval: str = Query("1h"),
    rr: float = Query(1.5),
    sw_window: int = Query(8),
):
    if not TA_AVAILABLE:
        raise HTTPException(status_code=503, detail="ta-lib not installed. Run: pip install ta")

    raw_train = fetch_yfinance(symbol, train_start, train_end, interval)
    raw_test = fetch_yfinance(symbol, test_start, test_end, interval)

    df_train = build_features(raw_train)

    # Warm up EMA/MACD for the test period using tail of training data.
    # Without this, on 1d the test period loses ~200 rows to NaN warmup,
    # leaving too few bars to generate signals.
    WARMUP = 220  # needs >= EMA_LEN (200)
    warmup_tail = raw_train.tail(WARMUP)
    raw_test_warmed = pd.concat([warmup_tail, raw_test])
    raw_test_warmed = raw_test_warmed[~raw_test_warmed.index.duplicated(keep="last")]
    df_test_warmed = build_features(raw_test_warmed)
    # Keep only actual test rows (drop warmup period)
    test_start_dt = pd.to_datetime(test_start, utc=True)
    df_test = df_test_warmed[df_test_warmed.index >= test_start_dt].copy()


    extra = ["EMA200", "MACD", "MACD_signal_line", "MACD_hist", "ema_signal", "macd_signal", "pre_signal"]

    train_bt = simple_backtest(df_train, rr=rr, sw_window=sw_window, interval=interval)
    test_bt = simple_backtest(df_test, rr=rr, sw_window=sw_window, interval=interval)

    train_ohlcv = df_to_ohlcv_list(df_train, extra)
    test_ohlcv = df_to_ohlcv_list(df_test, extra)

    return {
        "symbol": symbol.upper(),
        "interval": interval,
        "train": {
            "start": train_start,
            "end": train_end,
            "bars": len(train_ohlcv),
            "ohlcv": train_ohlcv,
            "backtest": train_bt,
        },
        "test": {
            "start": test_start,
            "end": test_end,
            "bars": len(test_ohlcv),
            "ohlcv": test_ohlcv,
            "backtest": test_bt,
        },
        "params": {"rr": rr, "sw_window": sw_window, "ema_len": EMA_LEN, "hist_window": HIST_WINDOW},
    }


@app.get("/api/symbols")
def get_symbols():
    return ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "GOOGL", "META", "SPY", "RELIANCE.NS", "HDFCBANK.NS", "ICICIBANK.NS", "TCS.NS", "INFY.NS", "BHARTIARTL.NS", "SBIN.NS", "HINDUNILVR.NS", "ITC.NS", "LT.NS"]
