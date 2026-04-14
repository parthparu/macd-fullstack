export default function StatusBar({ backendOk, apiData, symbol, rr, swWindow }) {
  return (
    <div className="status-bar">
      <span>
        <span className={`st-dot ${backendOk === true ? "g" : backendOk === false ? "r" : "y"}`} />
        {backendOk === true ? "Backend Online" : backendOk === false ? "Backend Offline" : "Checking..."}
      </span>
      <span><span className="st-dot y" />yfinance</span>
      <span>{apiData?.symbol || symbol}</span>
      {apiData && <span>Train: {apiData.train.bars} bars | Test: {apiData.test.bars} bars</span>}
      {apiData && <span>RR={rr} SW={swWindow}</span>}
      <span style={{ marginLeft: "auto" }}>{new Date().toLocaleTimeString()}</span>
    </div>
  );
}
