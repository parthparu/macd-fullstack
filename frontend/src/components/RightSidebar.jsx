import BacktestPanel from "./BacktestPanel";

export default function RightSidebar({
  signalMeta, displayData, mode,
  trainResult, testResult,
  activeBacktest, retDiff,
}) {
  return (
    <div className="sidebar-right">
      {/* Latest Signal */}
      <div className="panel">
        <div className="panel-hd"><span className="panel-ttl">Latest Signal</span></div>
        <div className="panel-bd">
          <div className={`sig-badge ${signalMeta.cls}`}>
            <div className="sig-dot" />
            {signalMeta.label}
          </div>
          <div className="meta-grid" style={{ marginBottom: "12px" }}>
            <div className="meta-card">
              <label>EMA Signal</label>
              <strong style={{ color: displayData?.ema_signal === 1 ? "var(--green)" : displayData?.ema_signal === -1 ? "var(--red)" : "var(--text-muted)" }}>
                {displayData?.ema_signal === 1 ? "UPTREND" : displayData?.ema_signal === -1 ? "DOWNTREND" : "NEUTRAL"}
              </strong>
            </div>
            <div className="meta-card">
              <label>MACD Signal</label>
              <strong style={{ color: displayData?.macd_signal === 1 ? "var(--green)" : displayData?.macd_signal === -1 ? "var(--red)" : "var(--text-muted)" }}>
                {displayData?.macd_signal === 1 ? "BULL CROSS" : displayData?.macd_signal === -1 ? "BEAR CROSS" : "NONE"}
              </strong>
            </div>
            <div className="meta-card">
              <label>Mode</label>
              <strong>{mode.toUpperCase()}</strong>
            </div>
            <div className="meta-card">
              <label>Hover Price</label>
              <strong>{displayData?.close?.toFixed(2) ?? "--"}</strong>
            </div>
          </div>
          <div className="callout">
            The chart now follows a trading-terminal pattern: focus on the active window, then use zoom and pan to inspect structure around each setup.
          </div>
        </div>
      </div>

      {/* Train Backtest */}
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-ttl">Train Backtest</span>
          <span className="split-label train">Train</span>
        </div>
        <div className="panel-bd">
          <BacktestPanel result={trainResult} label="train" />
        </div>
      </div>

      {/* Test Backtest */}
      <div className="panel">
        <div className="panel-hd">
          <span className="panel-ttl">Test Backtest</span>
          <span className="split-label test">Test</span>
        </div>
        <div className="panel-bd">
          <BacktestPanel result={testResult} label="test" />
        </div>
      </div>

      {/* Generalization */}
      {retDiff !== null && (
        <div className="panel">
          <div className="panel-hd"><span className="panel-ttl">Generalization</span></div>
          <div className="panel-bd">
            <div className="leg-row">
              <span style={{ color: "var(--text-muted)" }}>Return Delta</span>
              <span className={`diff-tag ${parseFloat(retDiff) >= 0 ? "up" : "dn"}`}>
                {parseFloat(retDiff) >= 0 ? "+" : ""}
                {retDiff}%
              </span>
            </div>
            <div className="leg-row">
              <span style={{ color: "var(--text-muted)" }}>Train WR</span>
              <span style={{ marginLeft: "auto", color: "var(--text-secondary)" }}>{trainResult?.winRate.toFixed(1)}%</span>
            </div>
            <div className="leg-row">
              <span style={{ color: "var(--text-muted)" }}>Test WR</span>
              <span style={{ marginLeft: "auto", color: "var(--text-secondary)" }}>{testResult?.winRate.toFixed(1)}%</span>
            </div>
            <div className="leg-row">
              <span style={{ color: "var(--text-muted)" }}>Assessment</span>
              <span style={{ marginLeft: "auto", color: Math.abs(parseFloat(retDiff)) < 10 ? "var(--green)" : "var(--yellow)" }}>
                {Math.abs(parseFloat(retDiff)) < 5 ? "Robust" : Math.abs(parseFloat(retDiff)) < 15 ? "Moderate" : "Overfit Risk"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Trade Log */}
      {activeBacktest?.trades?.length > 0 && (
        <div className="panel">
          <div className="panel-hd">
            <span className="panel-ttl">Trade Log ({mode})</span>
            <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{activeBacktest.trades.length}</span>
          </div>
          <div className="panel-bd" style={{ padding: "10px" }}>
            <div className="trades-list">
              {[...activeBacktest.trades].reverse().map((t, i) => (
                <div className="t-row" key={i}>
                  <span className={`t-type ${t.side}`}>{t.side === "long" ? "L" : "S"}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "8px" }}>
                    {new Date(t.entryDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span style={{ color: "var(--text-secondary)", fontSize: "8px" }}>{t.entryPrice}</span>
                  <span className={`t-pnl ${t.pnl >= 0 ? "pos" : "neg"}`}>
                    {t.pnl >= 0 ? "+" : ""}
                    {t.pnlPct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
