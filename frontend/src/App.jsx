import { useState, useEffect, useCallback, useMemo } from "react";
import { STYLE } from "./styles";
import Topbar from "./components/Topbar";
import LeftSidebar from "./components/LeftSidebar";
import ChartShell from "./components/ChartShell";
import RightSidebar from "./components/RightSidebar";
import StatusBar from "./components/StatusBar";

export default function App() {
  // --- Input state ---
  const [symbol, setSymbol] = useState("AAPL");
  const [trainStart, setTrainStart] = useState("2020-01-01");
  const [trainEnd, setTrainEnd] = useState("2024-12-31");
  const [testStart, setTestStart] = useState("2025-01-01");
  const [testEnd, setTestEnd] = useState("2026-02-28");
  const [interval, setInterval] = useState("1h");
  const [rr, setRr] = useState(1.5);
  const [swWindow, setSwWindow] = useState(8);

  // --- UI state ---
  const [mode, setMode] = useState("train");
  const [showEMA, setShowEMA] = useState(true);
  const [rangePreset, setRangePreset] = useState("6M");
  const [chartResetNonce, setChartResetNonce] = useState(0);
  const [crosshair, setCrosshair] = useState(null);

  // --- API state ---
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);
  const [backendOk, setBackendOk] = useState(null);

  // --- Health check ---
  useEffect(() => {
    fetch("/health")
      .then((r) => r.json())
      .then((d) => setBackendOk(d.status === "ok"))
      .catch(() => setBackendOk(false));
  }, []);

  // --- Derived data ---
  const activeData = useMemo(() => {
    if (!apiData) return null;
    return mode === "train" ? apiData.train.ohlcv : apiData.test.ohlcv;
  }, [apiData, mode]);

  const activeBacktest = useMemo(() => {
    if (!apiData) return null;
    return mode === "train" ? apiData.train.backtest : apiData.test.backtest;
  }, [apiData, mode]);

  const lastSignal = useMemo(() => {
    if (!activeData?.length) return 0;
    for (let i = activeData.length - 1; i >= 0; i--) {
      if (activeData[i].pre_signal !== 0) return activeData[i].pre_signal;
    }
    return 0;
  }, [activeData]);

  // --- Fetch ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ symbol, train_start: trainStart, train_end: trainEnd, test_start: testStart, test_end: testEnd, interval, rr, sw_window: swWindow });
      const res = await fetch(`/api/data?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      setApiData(await res.json());
      setRangePreset("6M");
      setChartResetNonce((n) => n + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [symbol, trainStart, trainEnd, testStart, testEnd, interval, rr, swWindow]);

  // --- Shared derived values ---
  const displayData = crosshair || (activeData ? activeData[activeData.length - 1] : null);
  const lastClose = activeData ? activeData[activeData.length - 1]?.close : 0;
  const prevClose = activeData?.length > 1 ? activeData[activeData.length - 2]?.close : lastClose;
  const pChange = lastClose - prevClose;
  const pChangePct = prevClose ? (pChange / prevClose) * 100 : 0;
  const isUp = pChange >= 0;
  const hoveredDate = displayData?.date ? new Date(displayData.date) : null;
  const barsCount = activeData?.length || 0;
  const signalMeta = {
    1: { label: "LONG SIGNAL", cls: "long" },
    [-1]: { label: "SHORT SIGNAL", cls: "short" },
    0: { label: "NO SIGNAL", cls: "neutral" },
  }[lastSignal] || { label: "NO SIGNAL", cls: "neutral" };
  const trainResult = apiData?.train?.backtest;
  const testResult = apiData?.test?.backtest;
  const retDiff = trainResult && testResult ? (testResult.totalReturn - trainResult.totalReturn).toFixed(1) : null;

  return (
    <div className="app">
      <style>{STYLE}</style>

      <div className="shell">
        <Topbar
          symbol={symbol} setSymbol={setSymbol} fetchData={fetchData}
          trainStart={trainStart} setTrainStart={setTrainStart}
          trainEnd={trainEnd} setTrainEnd={setTrainEnd}
          testStart={testStart} setTestStart={setTestStart}
          testEnd={testEnd} setTestEnd={setTestEnd}
          interval={interval} setInterval={setInterval}
          loading={loading} apiData={apiData}
          isUp={isUp} lastClose={lastClose} pChangePct={pChangePct}
          mode={mode} setMode={setMode}
        />

        <div className="main">
          <LeftSidebar
            apiData={apiData} symbol={symbol} interval={interval}
            isUp={isUp} lastClose={lastClose} signalMeta={signalMeta}
            barsCount={barsCount} hoveredDate={hoveredDate}
            rr={rr} setRr={setRr} swWindow={swWindow} setSwWindow={setSwWindow}
            showEMA={showEMA} setShowEMA={setShowEMA}
            displayData={displayData}
          />

          <ChartShell
            apiData={apiData} symbol={symbol} mode={mode}
            trainStart={trainStart} trainEnd={trainEnd}
            testStart={testStart} testEnd={testEnd}
            activeData={activeData} interval={interval} showEMA={showEMA}
            rangePreset={rangePreset} setRangePreset={setRangePreset}
            chartResetNonce={chartResetNonce} setChartResetNonce={setChartResetNonce}
            setCrosshair={setCrosshair} displayData={displayData}
            hoveredDate={hoveredDate} pChange={pChange} pChangePct={pChangePct}
            loading={loading} error={error} backendOk={backendOk}
          />

          <RightSidebar
            signalMeta={signalMeta} displayData={displayData} mode={mode}
            trainResult={trainResult} testResult={testResult}
            activeBacktest={activeBacktest} retDiff={retDiff}
          />
        </div>
      </div>

      <StatusBar
        backendOk={backendOk} apiData={apiData}
        symbol={symbol} rr={rr} swWindow={swWindow}
      />
    </div>
  );
}
