import StatCard from "./StatCard";
import EquityMini from "./EquityMini";

export default function BacktestPanel({ result, label }) {
  if (!result) {
    return (
      <div style={{ color: "var(--text-muted)", fontSize: "10px", padding: "12px 0", textAlign: "center", fontFamily: "var(--font-ui)" }}>
        Run to see {label} results
      </div>
    );
  }

  const r = result;

  return (
    <>
      <div className="stat-grid" style={{ marginBottom: "10px" }}>
        <StatCard label="Return" value={`${r.totalReturn >= 0 ? "+" : ""}${r.totalReturn.toFixed(1)}%`} cls={r.totalReturn >= 0 ? "g" : "r"} />
        <StatCard label="Win Rate" value={`${r.winRate.toFixed(1)}%`} cls={r.winRate >= 50 ? "g" : "y"} />
        <StatCard label="Max DD" value={`-${r.maxDrawdown.toFixed(1)}%`} cls="r" />
        <StatCard label="Sharpe" value={r.sharpe.toFixed(2)} cls={r.sharpe >= 1 ? "g" : r.sharpe >= 0 ? "y" : "r"} />
        <StatCard label="P. Factor" value={r.profitFactor >= 999 ? "--" : r.profitFactor.toFixed(2)} cls={r.profitFactor >= 1.5 ? "g" : "y"} />
        <StatCard label="Trades" value={r.numTrades} cls="b" />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <div style={{ fontSize: "8px", color: "var(--text-faint)", fontFamily: "var(--font-ui)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "5px" }}>
          Equity Curve
        </div>
        <EquityMini equityCurve={r.equityCurve} />
      </div>
      <div className="leg-row" style={{ fontSize: "10px" }}>
        <span style={{ color: "var(--text-muted)" }}>Final Capital</span>
        <span style={{ marginLeft: "auto", color: "var(--text-primary)", fontWeight: 800 }}>${r.finalEquity.toLocaleString()}</span>
      </div>
    </>
  );
}
