import CombinedChart from "./CombinedChart";
import { formatCompact } from "../utils";

export default function ChartShell({
  apiData, symbol, mode,
  trainStart, trainEnd, testStart, testEnd,
  activeData, interval, showEMA,
  rangePreset, setRangePreset,
  chartResetNonce, setChartResetNonce,
  setCrosshair, displayData,
  hoveredDate, pChange, pChangePct,
  loading, error, backendOk,
}) {
  return (
    <div className="chart-shell">
      {/* Chart Top Line: symbol + legend */}
      <div className="chart-topline">
        <div className="chart-title">
          <span className="chart-sym">{apiData?.symbol || symbol}</span>
          <span className={`split-label ${mode}`}>{mode === "train" ? "Training Period" : "Test Period"}</span>
          {apiData && (
            <div className="chart-meta">
              <span>{mode === "train" ? `${trainStart} to ${trainEnd}` : `${testStart} to ${testEnd}`}</span>
              <span>&middot;</span>
              <span>{activeData?.length} bars</span>
              <span>&middot;</span>
              <span>{interval.toUpperCase()} candles</span>
            </div>
          )}
        </div>
        <div className="chart-legend">
          {showEMA && (
            <div className="leg-item">
              <div className="leg-line" style={{ background: "var(--purple)" }} />
              <span>EMA 200</span>
            </div>
          )}
          <div className="leg-item">
            <div className="leg-line" style={{ background: "var(--macd-line)" }} />
            <span>MACD</span>
          </div>
          <div className="leg-item">
            <div className="leg-line" style={{ background: "var(--sig-line)" }} />
            <span>Signal</span>
          </div>
        </div>
      </div>

      {/* Range Toolbar */}
      <div className="chart-toolbar">
        <div className="toolbar-left">
          {["1M", "3M", "6M", "1Y", "YTD", "ALL"].map((preset) => (
            <button
              key={preset}
              className={`range-btn ${rangePreset === preset ? "active" : ""}`}
              onClick={() => setRangePreset(preset)}
            >
              {preset}
            </button>
          ))}
          <button className="ghost-btn" onClick={() => { setRangePreset("ALL"); setChartResetNonce((n) => n + 1); }}>
            Reset View
          </button>
        </div>
        <div className="toolbar-right">
          <div className="toolbar-note">Interactive view: crosshair, wheel zoom, drag pan</div>
        </div>
      </div>

      {/* OHLCV Bar */}
      <div className="chart-toolbar" style={{ paddingTop: "9px", paddingBottom: "9px" }}>
        <div className="chart-headline">
          {displayData && (
            <div className="ohlcv">
              <span><span>O</span><strong>{displayData.open?.toFixed(2)}</strong></span>
              <span><span>H</span><strong style={{ color: "var(--green)" }}>{displayData.high?.toFixed(2)}</strong></span>
              <span><span>L</span><strong style={{ color: "var(--red)" }}>{displayData.low?.toFixed(2)}</strong></span>
              <span><span>C</span><strong>{displayData.close?.toFixed(2)}</strong></span>
              <span><span>V</span><strong>{displayData.volume ? formatCompact(displayData.volume) : "--"}</strong></span>
            </div>
          )}
        </div>
        <div className="toolbar-note">
          {displayData?.pre_signal === 1 ? "Bullish setup visible" : displayData?.pre_signal === -1 ? "Bearish setup visible" : "Monitoring for fresh signal"}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="charts-wrap">
        {/* Hover tooltip */}
        {displayData && (
          <div className="hover-card">
            <h4>{hoveredDate ? hoveredDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Latest Candle"}</h4>
            <div className="hover-grid">
              <span>Close</span><span>{displayData.close?.toFixed(2) ?? "--"}</span>
              <span>Change</span><span style={{ color: pChange >= 0 ? "var(--green)" : "var(--red)" }}>{pChangePct.toFixed(2)}%</span>
              <span>MACD</span><span>{displayData.MACD?.toFixed(4) ?? "--"}</span>
              <span>Signal</span><span>{displayData.MACD_signal_line?.toFixed(4) ?? "--"}</span>
              <span>Histogram</span><span style={{ color: displayData.MACD_hist >= 0 ? "var(--green)" : "var(--red)" }}>{displayData.MACD_hist?.toFixed(4) ?? "--"}</span>
              <span>Volume</span><span>{displayData.volume ? formatCompact(displayData.volume) : "--"}</span>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="spinner" />
            <div className="loading-txt">Fetching {symbol} data from yfinance and computing strategy signals...</div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="err-banner">
            <div className="err-txt">Failed to load data</div>
            <div className="err-sub">{error}</div>
            {backendOk === false && (
              <div className="err-sub">
                Backend not reachable. Start with: <code style={{ color: "var(--yellow)" }}>uvicorn main:app --reload</code>
              </div>
            )}
          </div>
        )}

        {/* Chart or empty state */}
        {!loading && !error && (
          <>
            {activeData ? (
              <CombinedChart
                data={activeData}
                showEMA={showEMA}
                onCrosshair={setCrosshair}
                rangePreset={rangePreset}
                resetNonce={chartResetNonce}
              />
            ) : (
              <div className="no-data">
                Configure parameters and click Run Strategy to load real data from yfinance
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
