export default function LeftSidebar({
  apiData, symbol, interval,
  isUp, lastClose, signalMeta,
  barsCount, hoveredDate,
  rr, setRr, swWindow, setSwWindow,
  showEMA, setShowEMA,
  displayData,
}) {
  return (
    <div className="sidebar">
      {/* Headline Card */}
      <div className="panel">
        <div className="headline-card">
          <div className="headline-title">
            <div>
              <h2>{apiData?.symbol || symbol}</h2>
              <div className="headline-sub">Faster controls, clearer rails, and chart behavior tuned to feel closer to a trading terminal.</div>
            </div>
            <span className="pill live">{interval}</span>
          </div>
          <div className="mini-grid">
            <div className="mini-chip">
              <span>Last Price</span>
              <strong style={{ color: isUp ? "var(--green)" : "var(--red)" }}>{lastClose ? lastClose.toFixed(2) : "--"}</strong>
            </div>
            <div className="mini-chip">
              <span>Signal Bias</span>
              <strong>{signalMeta.label.replace(" SIGNAL", "")}</strong>
            </div>
            <div className="mini-chip">
              <span>Bars Loaded</span>
              <strong>{barsCount || "--"}</strong>
            </div>
            <div className="mini-chip">
              <span>Hover Date</span>
              <strong>{hoveredDate ? hoveredDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "--"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Params */}
      <div className="panel">
        <div className="panel-hd"><span className="panel-ttl">Strategy Params</span></div>
        <div className="panel-bd">
          <div className="p-row">
            <span className="p-lbl">EMA Length</span>
            <span style={{ color: "var(--text-primary)", fontSize: "12px", fontWeight: 800 }}>200</span>
          </div>
          <div className="p-row">
            <span className="p-lbl">Backcandles</span>
            <span style={{ color: "var(--text-primary)", fontSize: "12px", fontWeight: 800 }}>5</span>
          </div>
          <div className="p-row">
            <span className="p-lbl">Hist Window</span>
            <span style={{ color: "var(--text-primary)", fontSize: "12px", fontWeight: 800 }}>7</span>
          </div>
          <div className="p-row">
            <span className="p-lbl">Hist Thresh</span>
            <span style={{ color: "var(--text-primary)", fontSize: "12px", fontWeight: 800 }}>4e-6</span>
          </div>
          <div className="p-row">
            <span className="p-lbl">RR Ratio</span>
            <input className="p-inp" type="number" value={rr} min={0.5} max={5} step={0.5} onChange={(e) => setRr(parseFloat(e.target.value) || 1.5)} />
          </div>
          <div className="p-row">
            <span className="p-lbl">SW Window</span>
            <input className="p-inp" type="number" value={swWindow} min={2} max={20} onChange={(e) => setSwWindow(parseInt(e.target.value, 10) || 8)} />
          </div>
        </div>
      </div>

      {/* Display */}
      <div className="panel">
        <div className="panel-hd"><span className="panel-ttl">Display</span></div>
        <div className="panel-bd">
          <div className="tog-row">
            <span className="tog-lbl">EMA 200 Overlay</span>
            <button className={`tog ${showEMA ? "on" : ""}`} onClick={() => setShowEMA((v) => !v)} />
          </div>
          <div className="interaction-note">
            Scroll to zoom, drag to pan, and double-click anywhere on the chart to reset the viewport.
          </div>
        </div>
      </div>

      {/* Signal Logic */}
      <div className="panel">
        <div className="panel-hd"><span className="panel-ttl">Signal Logic</span></div>
        <div className="panel-bd">
          <div className="leg-row">
            <div className="leg-dot" style={{ background: "var(--green)" }} />
            <span>Long: EMA up + MACD bull cross below zero</span>
          </div>
          <div className="leg-row">
            <div className="leg-dot" style={{ background: "var(--red)" }} />
            <span>Short: EMA down + MACD bear cross above zero</span>
          </div>
          <div className="leg-row">
            <div className="leg-dot" style={{ background: "var(--orange)" }} />
            <span>Histogram window filter confirms momentum before entries</span>
          </div>
        </div>
      </div>

      {/* Indicator Values */}
      <div className="panel">
        <div className="panel-hd"><span className="panel-ttl">Indicator Values</span></div>
        <div className="panel-bd">
          {apiData ? (
            <>
              <div className="leg-row">
                <div className="leg-dot" style={{ background: "var(--macd-line)" }} />
                <span>MACD</span>
                <span className="leg-val" style={{ color: "var(--macd-line)" }}>{displayData?.MACD?.toFixed(4) ?? "--"}</span>
              </div>
              <div className="leg-row">
                <div className="leg-dot" style={{ background: "var(--sig-line)" }} />
                <span>Signal</span>
                <span className="leg-val" style={{ color: "var(--sig-line)" }}>{displayData?.MACD_signal_line?.toFixed(4) ?? "--"}</span>
              </div>
              <div className="leg-row">
                <div className="leg-dot" style={{ background: displayData?.MACD_hist >= 0 ? "var(--green)" : "var(--red)" }} />
                <span>Histogram</span>
                <span className="leg-val" style={{ color: displayData?.MACD_hist >= 0 ? "var(--green)" : "var(--red)" }}>
                  {displayData?.MACD_hist?.toFixed(4) ?? "--"}
                </span>
              </div>
              {showEMA && (
                <div className="leg-row" style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(87, 118, 152, 0.14)" }}>
                  <div className="leg-dot" style={{ background: "var(--purple)" }} />
                  <span>EMA 200</span>
                  <span className="leg-val" style={{ color: "var(--purple)" }}>{displayData?.EMA200?.toFixed(2) ?? "--"}</span>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: "10px", fontFamily: "var(--font-ui)" }}>
              Run strategy to see values
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
