export default function Topbar({
  symbol, setSymbol, fetchData,
  trainStart, setTrainStart,
  trainEnd, setTrainEnd,
  testStart, setTestStart,
  testEnd, setTestEnd,
  interval, setInterval,
  loading, apiData, isUp,
  lastClose, pChangePct,
  mode, setMode,
}) {
  return (
    <div className="topbar">
      <div className="logo">
        <div className="logo-mark">M</div>
        MACD Strategy
      </div>

      <div className="toolbar-cluster">
        <div className="field-grp">
          <span>Symbol</span>
          <input
            className="sym-inp"
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && fetchData()}
            maxLength={10}
          />
        </div>

        <div className="sep" />

        <div className="field-grp">
          <span>Train</span>
          <input className="date-inp" type="date" value={trainStart} onChange={(e) => setTrainStart(e.target.value)} />
          <span>to</span>
          <input className="date-inp" type="date" value={trainEnd} onChange={(e) => setTrainEnd(e.target.value)} />
        </div>

        <div className="field-grp">
          <span>Test</span>
          <input className="date-inp" type="date" value={testStart} onChange={(e) => setTestStart(e.target.value)} />
          <span>to</span>
          <input className="date-inp" type="date" value={testEnd} onChange={(e) => setTestEnd(e.target.value)} />
        </div>

        <div className="field-grp">
          <span>Interval</span>
          <select value={interval} onChange={(e) => setInterval(e.target.value)}>
            <option value="1h">1h</option>
            <option value="1d">1d</option>
          </select>
        </div>
      </div>

      {apiData && (
        <div className="price-block">
          <span className="price-val" style={{ color: isUp ? "var(--green)" : "var(--red)" }}>
            {lastClose >= 1000 ? lastClose.toFixed(0) : lastClose.toFixed(2)}
          </span>
          <span className={`price-badge ${isUp ? "up" : "dn"}`}>
            {isUp ? "+" : ""}
            {pChangePct.toFixed(2)}%
          </span>
        </div>
      )}

      <div className="spacer" />

      <div className="mode-tabs">
        <button className={`mode-tab ${mode === "train" ? "active" : ""}`} onClick={() => setMode("train")}>Train</button>
        <button className={`mode-tab ${mode === "test" ? "active" : ""}`} onClick={() => setMode("test")}>Test</button>
      </div>

      <button className="run-btn" onClick={fetchData} disabled={loading}>
        {loading ? "Loading..." : "Run Strategy"}
      </button>
    </div>
  );
}
