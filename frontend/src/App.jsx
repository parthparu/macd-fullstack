import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "d3";

const API = "";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Archivo:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-base: #071019;
    --bg-shell: #0c1622;
    --bg-chart: #09131d;
    --bg-surface: rgba(14, 24, 36, 0.92);
    --bg-elevated: rgba(20, 31, 47, 0.96);
    --bg-soft: rgba(16, 27, 40, 0.9);
    --border: rgba(85, 118, 155, 0.2);
    --border-strong: rgba(108, 153, 203, 0.3);
    --text-primary: #d8e7f5;
    --text-secondary: #89a6c3;
    --text-muted: #516b86;
    --text-faint: #314457;
    --green: #27c281;
    --red: #ea5a64;
    --blue: #46a0ff;
    --yellow: #f5b34d;
    --orange: #ec9444;
    --purple: #8d95ff;
    --macd-line: #8ba4e8;
    --sig-line: #e8924a;
    --shadow: 0 16px 32px rgba(0, 0, 0, 0.32);
    --font-mono: 'IBM Plex Mono', monospace;
    --font-ui: 'Archivo', sans-serif;
    --r: 10px;
    --rl: 16px;
  }

  html, body, #root {
    height: 100%;
    background:
      radial-gradient(circle at top left, rgba(70,160,255,0.12), transparent 28%),
      radial-gradient(circle at top right, rgba(39,194,129,0.08), transparent 24%),
      linear-gradient(180deg, #08111b 0%, #071019 100%);
    color: var(--text-primary);
    font-family: var(--font-mono);
    overflow: hidden;
  }

  body { min-height: 100vh; }

  .app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    background:
      radial-gradient(circle at 10% 10%, rgba(77,158,247,0.08), transparent 22%),
      radial-gradient(circle at 90% 0%, rgba(240,168,64,0.08), transparent 18%);
  }

  .shell {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .topbar {
    min-height: 64px;
    background: linear-gradient(180deg, rgba(18, 31, 46, 0.96), rgba(12, 21, 33, 0.96));
    border: 1px solid var(--border);
    border-radius: 18px;
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    padding: 10px 14px;
    gap: 12px;
    flex-wrap: wrap;
  }

  .logo {
    font-family: var(--font-ui);
    font-size: 16px;
    font-weight: 900;
    letter-spacing: -0.25px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 9px;
    white-space: nowrap;
  }

  .logo-mark {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, var(--blue), #7bc1ff);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 900;
    color: #03101a;
    box-shadow: 0 8px 18px rgba(70, 160, 255, 0.3);
  }

  .toolbar-cluster {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: rgba(8, 16, 26, 0.5);
  }

  .sep {
    width: 1px;
    align-self: stretch;
    background: linear-gradient(180deg, transparent, rgba(91, 126, 163, 0.35), transparent);
  }

  input[type="text"], input[type="date"], select {
    background: rgba(9, 17, 27, 0.86);
    border: 1px solid var(--border);
    border-radius: 9px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    padding: 7px 10px;
    outline: none;
    transition: border-color 0.12s, box-shadow 0.12s, background 0.12s;
  }

  input[type="text"]:focus, input[type="date"]:focus, select:focus {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgba(70, 160, 255, 0.14);
    background: rgba(10, 20, 31, 0.96);
  }

  .sym-inp { width: 88px; text-transform: uppercase; }
  .date-inp { width: 132px; }

  .field-grp {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    color: var(--text-muted);
    flex-wrap: wrap;
  }

  .field-grp > span:first-child {
    font-family: var(--font-ui);
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: var(--text-faint);
  }

  .run-btn,
  .ghost-btn,
  .range-btn {
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.12s, opacity 0.12s, background 0.12s, color 0.12s, border-color 0.12s;
    font-family: var(--font-ui);
    font-weight: 800;
    letter-spacing: 0.4px;
  }

  .run-btn {
    background: linear-gradient(135deg, var(--blue), #77bfff);
    color: #03101a;
    font-size: 11px;
    padding: 9px 16px;
    text-transform: uppercase;
    box-shadow: 0 10px 20px rgba(70, 160, 255, 0.22);
  }

  .run-btn:hover, .ghost-btn:hover, .range-btn:hover { transform: translateY(-1px); }
  .run-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  .ghost-btn {
    background: rgba(13, 24, 37, 0.88);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    font-size: 10px;
    padding: 8px 11px;
    text-transform: uppercase;
  }

  .ghost-btn.active {
    background: rgba(70, 160, 255, 0.16);
    border-color: rgba(70, 160, 255, 0.4);
    color: #cde6ff;
  }

  .price-block {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-left: auto;
    padding: 4px 0;
  }

  .price-val { font-family: var(--font-ui); font-size: 19px; font-weight: 900; }
  .price-badge { font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 999px; }
  .price-badge.up { background: rgba(38,194,129,0.16); color: var(--green); }
  .price-badge.dn { background: rgba(234,90,100,0.16); color: var(--red); }

  .spacer { flex: 1; }

  .mode-tabs {
    display: flex;
    gap: 4px;
    background: rgba(9, 18, 29, 0.84);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 4px;
  }

  .mode-tab {
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--text-muted);
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 800;
    padding: 7px 12px;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .mode-tab.active {
    background: linear-gradient(135deg, rgba(236, 148, 68, 0.95), rgba(255, 188, 109, 0.95));
    color: #1e1206;
  }

  .main {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(270px, 310px) minmax(0, 1fr) minmax(290px, 340px);
    gap: 12px;
  }

  .sidebar, .sidebar-right {
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 2px;
  }

  .panel {
    background: linear-gradient(180deg, rgba(16, 26, 38, 0.98), rgba(12, 20, 31, 0.98));
    border: 1px solid var(--border);
    border-radius: var(--rl);
    overflow: hidden;
    box-shadow: var(--shadow);
    backdrop-filter: blur(12px);
  }

  .panel-hd {
    padding: 11px 14px;
    border-bottom: 1px solid rgba(87, 118, 152, 0.14);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .panel-ttl {
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .panel-bd { padding: 14px; }

  .headline-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .headline-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .headline-title h2 {
    font-family: var(--font-ui);
    font-size: 18px;
    font-weight: 900;
    letter-spacing: -0.3px;
  }

  .headline-sub {
    color: var(--text-secondary);
    font-size: 11px;
    line-height: 1.5;
  }

  .mini-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .mini-chip {
    background: rgba(7, 16, 26, 0.72);
    border: 1px solid rgba(88, 122, 157, 0.14);
    border-radius: 12px;
    padding: 10px 11px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mini-chip span:first-child {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--text-faint);
    font-family: var(--font-ui);
    font-weight: 800;
  }

  .mini-chip strong {
    font-size: 14px;
    font-family: var(--font-ui);
  }

  .p-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }

  .p-row:last-child { margin-bottom: 0; }
  .p-lbl { font-size: 11px; color: var(--text-secondary); }

  .p-inp {
    background: rgba(8, 16, 25, 0.82);
    border: 1px solid var(--border);
    border-radius: 9px;
    color: var(--text-primary);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    padding: 7px 9px;
    width: 72px;
    text-align: right;
    outline: none;
  }

  .p-inp:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(70, 160, 255, 0.14); }

  .stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .stat-card {
    background: linear-gradient(180deg, rgba(8, 17, 27, 0.94), rgba(11, 20, 31, 0.94));
    border: 1px solid rgba(82, 118, 157, 0.16);
    border-radius: 14px;
    padding: 10px 11px;
  }

  .stat-lbl {
    font-size: 8px;
    color: var(--text-faint);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-bottom: 4px;
    font-family: var(--font-ui);
    font-weight: 800;
  }

  .stat-val { font-family: var(--font-ui); font-size: 15px; font-weight: 900; }
  .g { color: var(--green); }
  .r { color: var(--red); }
  .b { color: var(--blue); }
  .y { color: var(--yellow); }

  .split-label, .pill {
    font-size: 9px;
    font-weight: 800;
    padding: 4px 9px;
    border-radius: 999px;
    font-family: var(--font-ui);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .split-label.train, .pill.train { background: rgba(77,158,247,0.15); color: var(--blue); }
  .split-label.test, .pill.test { background: rgba(240,168,64,0.15); color: var(--yellow); }
  .pill.live { background: rgba(39,194,129,0.14); color: var(--green); }

  .sig-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 11px 14px;
    border-radius: 14px;
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.5px;
    width: 100%;
    margin-bottom: 12px;
  }

  .sig-badge.long { background: rgba(38,194,129,0.12); color: var(--green); border: 1px solid rgba(38,194,129,0.24); }
  .sig-badge.short { background: rgba(234,90,100,0.12); color: var(--red); border: 1px solid rgba(234,90,100,0.24); }
  .sig-badge.neutral { background: rgba(100,130,170,0.08); color: var(--text-muted); border: 1px solid var(--border); }

  .sig-dot { width: 8px; height: 8px; border-radius: 50%; }
  .sig-badge.long .sig-dot { background: var(--green); box-shadow: 0 0 8px rgba(39,194,129,0.7); animation: blink 1.4s infinite; }
  .sig-badge.short .sig-dot { background: var(--red); box-shadow: 0 0 8px rgba(234,90,100,0.7); animation: blink 1.4s infinite; }
  .sig-badge.neutral .sig-dot { background: var(--text-muted); }

  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

  .trades-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 240px;
    overflow-y: auto;
  }

  .t-row {
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    align-items: center;
    gap: 8px;
    padding: 8px 9px;
    background: rgba(8, 16, 26, 0.82);
    border: 1px solid rgba(84, 120, 158, 0.12);
    border-radius: 12px;
    font-size: 9px;
  }

  .t-type {
    font-weight: 800;
    font-size: 8px;
    padding: 3px 6px;
    border-radius: 999px;
    min-width: 32px;
    text-align: center;
    font-family: var(--font-ui);
  }

  .t-type.long { background: rgba(38,194,129,0.15); color: var(--green); }
  .t-type.short { background: rgba(234,90,100,0.15); color: var(--red); }
  .t-pnl { margin-left: auto; font-weight: 800; }
  .t-pnl.pos { color: var(--green); }
  .t-pnl.neg { color: var(--red); }

  .chart-shell {
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(11, 19, 29, 0.98), rgba(8, 15, 24, 0.98));
    border: 1px solid var(--border-strong);
    border-radius: 22px;
    box-shadow: var(--shadow);
    position: relative;
  }

  .chart-topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px 10px;
    border-bottom: 1px solid rgba(88, 121, 154, 0.14);
    flex-wrap: wrap;
  }

  .chart-title {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .chart-sym {
    font-family: var(--font-ui);
    font-size: 18px;
    font-weight: 900;
    color: var(--text-primary);
    letter-spacing: -0.3px;
  }

  .chart-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    color: var(--text-secondary);
    font-size: 10px;
    font-family: var(--font-ui);
  }

  .chart-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(88, 121, 154, 0.12);
    background: rgba(8, 15, 24, 0.78);
    flex-wrap: wrap;
  }

  .toolbar-left, .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .range-btn {
    padding: 7px 10px;
    font-size: 10px;
    background: rgba(10, 19, 30, 0.88);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    text-transform: uppercase;
  }

  .range-btn.active {
    background: rgba(77,158,247,0.18);
    border-color: rgba(77,158,247,0.4);
    color: #d8eefe;
  }

  .toolbar-note {
    color: var(--text-faint);
    font-size: 10px;
    font-family: var(--font-ui);
  }

  .chart-headline {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .ohlcv {
    display: flex;
    gap: 10px;
    font-size: 10px;
    color: var(--text-muted);
    flex-wrap: wrap;
  }

  .ohlcv span { display: flex; gap: 4px; }
  .ohlcv strong { color: var(--text-secondary); font-weight: 700; }

  .chart-legend {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .leg-item {
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--text-secondary);
    font-family: var(--font-ui);
    font-size: 10px;
    font-weight: 700;
  }

  .leg-line { width: 16px; height: 2px; border-radius: 999px; }

  .charts-wrap {
    flex: 1;
    min-height: 0;
    position: relative;
    background:
      linear-gradient(180deg, rgba(6, 12, 20, 0.22), transparent),
      linear-gradient(180deg, rgba(8, 17, 27, 0.7), rgba(7, 14, 23, 0.92));
  }

  .price-tag-el {
    position: absolute;
    right: 10px;
    transform: translateY(-50%);
    background: linear-gradient(135deg, var(--blue), #76bdff);
    color: #03101a;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 800;
    padding: 4px 7px 4px 9px;
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
    display: flex;
    align-items: center;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(70, 160, 255, 0.26);
  }

  .loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(7, 12, 20, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 50;
    gap: 14px;
    backdrop-filter: blur(6px);
  }

  .spinner {
    width: 30px;
    height: 30px;
    border: 2px solid rgba(87, 118, 152, 0.24);
    border-top-color: var(--blue);
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .loading-txt {
    font-size: 11px;
    color: var(--text-secondary);
    font-family: var(--font-ui);
    text-align: center;
    max-width: 420px;
  }

  .err-banner {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    z-index: 40;
    padding: 18px;
  }

  .err-txt {
    color: var(--red);
    font-size: 14px;
    font-family: var(--font-ui);
    font-weight: 700;
  }

  .err-sub {
    color: var(--text-muted);
    font-size: 11px;
    font-family: var(--font-ui);
    max-width: 420px;
    text-align: center;
    line-height: 1.5;
  }

  .status-bar {
    min-height: 34px;
    background: linear-gradient(180deg, rgba(14, 24, 36, 0.96), rgba(10, 18, 28, 0.96));
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    padding: 0 14px;
    gap: 14px;
    font-size: 10px;
    color: var(--text-muted);
    flex-shrink: 0;
    font-family: var(--font-ui);
    font-weight: 600;
    letter-spacing: 0.25px;
    flex-wrap: wrap;
  }

  .st-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
  }

  .st-dot.g { background: var(--green); box-shadow: 0 0 6px rgba(39,194,129,0.8); }
  .st-dot.y { background: var(--yellow); }
  .st-dot.r { background: var(--red); }

  .eq-svg { width: 100%; height: 52px; display: block; }

  .leg-row {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 7px;
    font-size: 10px;
    color: var(--text-secondary);
  }

  .leg-row:last-child { margin-bottom: 0; }
  .leg-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .leg-val { margin-left: auto; font-weight: 700; font-size: 10px; }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .meta-card {
    padding: 10px 11px;
    border-radius: 12px;
    border: 1px solid rgba(82, 118, 157, 0.12);
    background: rgba(9, 17, 27, 0.72);
    min-width: 0;
  }

  .meta-card label {
    display: block;
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--text-faint);
    font-family: var(--font-ui);
    font-weight: 800;
    margin-bottom: 4px;
  }

  .meta-card strong {
    display: block;
    font-family: var(--font-ui);
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .callout {
    padding: 11px 12px;
    border-radius: 13px;
    background: linear-gradient(135deg, rgba(70,160,255,0.12), rgba(141,149,255,0.08));
    border: 1px solid rgba(104, 144, 189, 0.18);
    color: var(--text-secondary);
    font-size: 10px;
    line-height: 1.6;
  }

  .diff-tag {
    font-size: 9px;
    font-weight: 800;
    padding: 3px 7px;
    border-radius: 999px;
    font-family: var(--font-ui);
  }

  .diff-tag.up { background: rgba(38,194,129,0.12); color: var(--green); }
  .diff-tag.dn { background: rgba(234,90,100,0.12); color: var(--red); }

  .hover-card {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 8;
    min-width: 220px;
    background: rgba(8, 15, 24, 0.9);
    border: 1px solid rgba(92, 124, 159, 0.22);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
    border-radius: 14px;
    padding: 10px 12px;
    backdrop-filter: blur(10px);
    pointer-events: none;
  }

  .hover-card h4 {
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: 800;
    margin-bottom: 8px;
    color: var(--text-primary);
  }

  .hover-card .hover-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 12px;
    font-size: 10px;
  }

  .hover-grid span:nth-child(odd) { color: var(--text-faint); }
  .hover-grid span:nth-child(even) { text-align: right; color: var(--text-secondary); font-weight: 700; }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(88, 121, 154, 0.24); border-radius: 999px; }

  svg { display: block; }
  svg text { font-family: 'IBM Plex Mono', monospace; }

  .no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
    font-size: 12px;
    font-family: var(--font-ui);
    padding: 30px;
    text-align: center;
  }

  .tog {
    width: 34px;
    height: 19px;
    background: rgba(76, 99, 122, 0.45);
    border-radius: 999px;
    border: none;
    cursor: pointer;
    position: relative;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .tog.on { background: rgba(39, 194, 129, 0.85); }

  .tog::after {
    content: '';
    position: absolute;
    width: 13px;
    height: 13px;
    background: white;
    border-radius: 50%;
    top: 3px;
    left: 3px;
    transition: transform 0.2s;
  }

  .tog.on::after { transform: translateX(15px); }

  .tog-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .tog-row:last-child { margin-bottom: 0; }
  .tog-lbl { font-size: 11px; color: var(--text-secondary); }

  .interaction-note {
    font-size: 10px;
    color: var(--text-faint);
    line-height: 1.6;
  }

  @media (max-width: 1380px) {
    .main { grid-template-columns: minmax(250px, 285px) minmax(0, 1fr) minmax(270px, 310px); }
  }

  @media (max-width: 1180px) {
    html, body, #root, .app { overflow: auto; }
    .app { height: auto; min-height: 100vh; }
    .shell { min-height: auto; }
    .main {
      grid-template-columns: 1fr;
      grid-template-areas:
        "chart"
        "left"
        "right";
    }
    .sidebar { grid-area: left; }
    .chart-shell { grid-area: chart; min-height: 72vh; }
    .sidebar-right { grid-area: right; }
  }

  @media (max-width: 760px) {
    .app { padding: 8px; gap: 8px; }
    .topbar, .status-bar { border-radius: 14px; }
    .topbar { padding: 10px; }
    .toolbar-cluster { width: 100%; }
    .price-block { margin-left: 0; }
    .chart-topline, .chart-toolbar { padding-left: 12px; padding-right: 12px; }
    .chart-shell { border-radius: 18px; min-height: 68vh; }
    .chart-sym { font-size: 16px; }
    .hover-card { min-width: 184px; }
    .meta-grid, .mini-grid, .stat-grid { grid-template-columns: 1fr 1fr; }
  }
`;

function formatCompact(value) {
  if (value == null || Number.isNaN(value)) return "--";
  return value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(1)}M`
    : value >= 1_000
      ? `${(value / 1_000).toFixed(1)}K`
      : value.toFixed(2);
}

function presetDomain(data, preset) {
  if (!data?.length || preset === "ALL") return null;
  const end = new Date(data[data.length - 1].date);
  const start = new Date(end);
  const monthMap = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 };
  if (preset === "YTD") {
    start.setMonth(0, 1);
  } else if (monthMap[preset]) {
    start.setMonth(start.getMonth() - monthMap[preset]);
  } else {
    return null;
  }
  return [start, end];
}

function CombinedChart({ data, showEMA, onCrosshair, rangePreset, resetNonce }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const priceTagRef = useRef(null);
  const zoomBehaviorRef = useRef(null);
  const zoomTransformRef = useRef(d3.zoomIdentity);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current || dims.w === 0 || dims.h === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const parsedData = data.map((d) => ({
      ...d,
      date: new Date(d.date),
    }));
    if (!parsedData.length) return;

    const W_total = dims.w;
    const H_total = dims.h;
    const ML = 14;
    const MR = 74;
    const MTOP = 18;
    const MBOT = 26;
    const W = Math.max(0, W_total - ML - MR);
    const PRICEH = Math.floor(H_total * 0.66);
    const priceInnerH = Math.max(0, PRICEH - MTOP - MBOT);
    const macdTop = PRICEH + 6;
    const macdInnerH = Math.max(0, H_total - macdTop - MBOT);

    svg.attr("width", W_total).attr("height", H_total);

    const baseX = d3.scaleTime()
      .domain(d3.extent(parsedData, (d) => d.date))
      .range([ML, ML + W]);

    const overlay = svg.append("rect")
      .attr("x", ML)
      .attr("y", 0)
      .attr("width", W)
      .attr("height", H_total)
      .attr("fill", "transparent")
      .style("cursor", "crosshair");

    const mainG = svg.append("g");
    const crossG = svg.append("g").style("display", "none").attr("pointer-events", "none");
    const xLabel = crossG.append("g");
    const yPriceLabel = crossG.append("g");
    const yMacdLabel = crossG.append("g");

    crossG.append("line")
      .attr("class", "cx")
      .attr("y1", MTOP)
      .attr("y2", macdTop + macdInnerH)
      .attr("stroke", "rgba(77,158,247,0.55)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    crossG.append("line")
      .attr("class", "cy-price")
      .attr("x1", ML)
      .attr("x2", ML + W)
      .attr("stroke", "rgba(77,158,247,0.35)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    crossG.append("line")
      .attr("class", "cy-macd")
      .attr("x1", ML)
      .attr("x2", ML + W)
      .attr("stroke", "rgba(77,158,247,0.25)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    let currentXScale = baseX;
    let currentYPrice = null;
    let currentYMacd = null;
    let currentVisible = parsedData;

    const drawAxisLabel = (group, x, y, text, fill) => {
      group.selectAll("*").remove();
      group.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", Math.max(44, text.length * 7.1))
        .attr("height", 18)
        .attr("rx", 7)
        .attr("fill", fill)
        .attr("opacity", 0.94);
      group.append("text")
        .attr("x", x + 8)
        .attr("y", y + 12)
        .attr("fill", "#04111b")
        .style("font-size", "9px")
        .style("font-weight", 700)
        .text(text);
    };

    const draw = (transform = zoomTransformRef.current) => {
      mainG.selectAll("*").remove();

      currentXScale = transform.rescaleX(baseX);
      const [domainStart, domainEnd] = currentXScale.domain();
      currentVisible = parsedData.filter((d) => d.date >= domainStart && d.date <= domainEnd);
      if (currentVisible.length < 2) currentVisible = parsedData;

      const priceMin = d3.min(currentVisible, (d) => d.low) * 0.996;
      const priceMax = d3.max(currentVisible, (d) => d.high) * 1.004;
      currentYPrice = d3.scaleLinear()
        .domain([priceMin, priceMax])
        .range([MTOP + priceInnerH, MTOP]);

      const macdVals = currentVisible.flatMap((d) => [d.MACD, d.MACD_signal_line, 0].filter((v) => v != null));
      const histVals = currentVisible.map((d) => d.MACD_hist).filter((v) => v != null);
      const [mMinRaw, mMaxRaw] = d3.extent([...macdVals, ...histVals]);
      const mMin = mMinRaw ?? -1;
      const mMax = mMaxRaw ?? 1;
      const mPad = Math.abs(mMax - mMin) * 0.16 || 0.08;
      currentYMacd = d3.scaleLinear()
        .domain([mMin - mPad, mMax + mPad])
        .range([macdTop + macdInnerH, macdTop + 4]);

      const priceGrid = mainG.append("g");
      currentYPrice.ticks(7).forEach((t) => {
        priceGrid.append("line")
          .attr("x1", ML)
          .attr("x2", ML + W)
          .attr("y1", currentYPrice(t))
          .attr("y2", currentYPrice(t))
          .attr("stroke", "rgba(56, 82, 108, 0.46)")
          .attr("stroke-width", 1);
      });

      currentXScale.ticks(8).forEach((t) => {
        const x = currentXScale(t);
        priceGrid.append("line")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", MTOP)
          .attr("y2", MTOP + priceInnerH)
          .attr("stroke", "rgba(41, 64, 88, 0.42)")
          .attr("stroke-width", 1);
      });

      const macdGrid = mainG.append("g");
      currentYMacd.ticks(4).forEach((t) => {
        macdGrid.append("line")
          .attr("x1", ML)
          .attr("x2", ML + W)
          .attr("y1", currentYMacd(t))
          .attr("y2", currentYMacd(t))
          .attr("stroke", "rgba(56, 82, 108, 0.42)")
          .attr("stroke-width", 1);
      });

      currentXScale.ticks(8).forEach((t) => {
        const x = currentXScale(t);
        macdGrid.append("line")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", macdTop + 4)
          .attr("y2", macdTop + macdInnerH)
          .attr("stroke", "rgba(41, 64, 88, 0.42)")
          .attr("stroke-width", 1);
      });

      mainG.append("line")
        .attr("x1", ML)
        .attr("x2", ML + W)
        .attr("y1", currentYMacd(0))
        .attr("y2", currentYMacd(0))
        .attr("stroke", "rgba(129, 159, 193, 0.6)")
        .attr("stroke-width", 1.2)
        .attr("stroke-dasharray", "5,4");

      const candleW = Math.max(2, Math.min(13, W / currentVisible.length - 1.5));
      const candleG = mainG.append("g");

      currentVisible.forEach((d) => {
        const x = currentXScale(d.date);
        const isUp = d.close >= d.open;
        const color = isUp ? "#27c281" : "#ea5a64";
        candleG.append("line")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", currentYPrice(d.high))
          .attr("y2", currentYPrice(d.low))
          .attr("stroke", color)
          .attr("stroke-width", 1);

        const bodyTop = currentYPrice(Math.max(d.open, d.close));
        const bodyHeight = Math.max(1.5, Math.abs(currentYPrice(d.open) - currentYPrice(d.close)));

        candleG.append("rect")
          .attr("x", x - candleW / 2)
          .attr("y", bodyTop)
          .attr("width", candleW)
          .attr("height", bodyHeight)
          .attr("rx", candleW > 8 ? 2 : 0)
          .attr("fill", isUp ? "rgba(39,194,129,0.88)" : "rgba(234,90,100,0.9)");
      });

      if (showEMA) {
        const emaLine = d3.line()
          .defined((d) => d[1] != null)
          .x((d) => currentXScale(d[0]))
          .y((d) => currentYPrice(d[1]))
          .curve(d3.curveMonotoneX);

        mainG.append("path")
          .datum(currentVisible.map((d) => [d.date, d.EMA200]))
          .attr("fill", "none")
          .attr("stroke", "#8d95ff")
          .attr("stroke-width", 1.8)
          .attr("opacity", 0.95)
          .attr("d", emaLine);
      }

      const signalG = mainG.append("g");
      currentVisible.forEach((d) => {
        if (d.pre_signal === 1) {
          signalG.append("line")
            .attr("x1", currentXScale(d.date))
            .attr("x2", currentXScale(d.date))
            .attr("y1", MTOP)
            .attr("y2", MTOP + priceInnerH)
            .attr("stroke", "rgba(39,194,129,0.16)")
            .attr("stroke-width", 1.4)
            .attr("stroke-dasharray", "4,4");
          signalG.append("polygon")
            .attr("points", () => {
              const cx = currentXScale(d.date);
              const cy = currentYPrice(d.low) + 10;
              return `${cx},${cy - 8} ${cx - 5},${cy} ${cx + 5},${cy}`;
            })
            .attr("fill", "#27c281")
            .attr("opacity", 0.9);
        }

        if (d.pre_signal === -1) {
          signalG.append("line")
            .attr("x1", currentXScale(d.date))
            .attr("x2", currentXScale(d.date))
            .attr("y1", MTOP)
            .attr("y2", MTOP + priceInnerH)
            .attr("stroke", "rgba(234,90,100,0.16)")
            .attr("stroke-width", 1.4)
            .attr("stroke-dasharray", "4,4");
          signalG.append("polygon")
            .attr("points", () => {
              const cx = currentXScale(d.date);
              const cy = currentYPrice(d.high) - 10;
              return `${cx},${cy + 8} ${cx - 5},${cy} ${cx + 5},${cy}`;
            })
            .attr("fill", "#ea5a64")
            .attr("opacity", 0.92);
        }
      });

      const barW = Math.max(2, Math.min(11, W / currentVisible.length - 1));
      const histG = mainG.append("g");
      currentVisible.forEach((d) => {
        if (d.MACD_hist == null) return;
        const pos = d.MACD_hist >= 0;
        histG.append("rect")
          .attr("x", currentXScale(d.date) - barW / 2)
          .attr("y", currentYMacd(Math.max(0, d.MACD_hist)))
          .attr("width", barW)
          .attr("height", Math.max(1, Math.abs(currentYMacd(d.MACD_hist) - currentYMacd(0))))
          .attr("fill", pos ? "rgba(39,194,129,0.72)" : "rgba(234,90,100,0.74)");
      });

      const macdLineGen = d3.line()
        .defined((d) => d[1] != null)
        .x((d) => currentXScale(d[0]))
        .y((d) => currentYMacd(d[1]))
        .curve(d3.curveMonotoneX);

      mainG.append("path")
        .datum(currentVisible.map((d) => [d.date, d.MACD]))
        .attr("fill", "none")
        .attr("stroke", "#8ba4e8")
        .attr("stroke-width", 1.7)
        .attr("d", macdLineGen);

      mainG.append("path")
        .datum(currentVisible.map((d) => [d.date, d.MACD_signal_line]))
        .attr("fill", "none")
        .attr("stroke", "#e8924a")
        .attr("stroke-width", 1.5)
        .attr("d", macdLineGen);

      const pYAxis = d3.axisRight(currentYPrice).ticks(7)
        .tickFormat((v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(2)));
      const pYG = mainG.append("g")
        .attr("transform", `translate(${ML + W},0)`)
        .call(pYAxis);
      pYG.selectAll("text").style("fill", "#6280a0").style("font-size", "9px");
      pYG.select(".domain").remove();
      pYG.selectAll(".tick line").remove();

      const mYAxis = d3.axisRight(currentYMacd).ticks(4).tickFormat((v) => v.toFixed(2));
      const mYG = mainG.append("g")
        .attr("transform", `translate(${ML + W},0)`)
        .call(mYAxis);
      mYG.selectAll("text").style("fill", "#6280a0").style("font-size", "9px");
      mYG.select(".domain").remove();
      mYG.selectAll(".tick line").remove();

      const timeFmt = currentVisible.length > 220 ? d3.timeFormat("%b '%y") : d3.timeFormat("%b %d");
      const xPriceAxis = mainG.append("g").attr("transform", `translate(0,${MTOP + priceInnerH})`);
      xPriceAxis.call(d3.axisBottom(currentXScale).ticks(6).tickFormat(timeFmt));
      xPriceAxis.selectAll("text").style("fill", "#6280a0").style("font-size", "9px");
      xPriceAxis.select(".domain").style("stroke", "rgba(74,102,130,0.7)");
      xPriceAxis.selectAll(".tick line").style("stroke", "rgba(74,102,130,0.45)");

      const xMacdAxis = mainG.append("g").attr("transform", `translate(0,${macdTop + macdInnerH})`);
      xMacdAxis.call(d3.axisBottom(currentXScale).ticks(6).tickFormat(timeFmt));
      xMacdAxis.selectAll("text").style("fill", "#6280a0").style("font-size", "9px");
      xMacdAxis.select(".domain").style("stroke", "rgba(74,102,130,0.7)");
      xMacdAxis.selectAll(".tick line").style("stroke", "rgba(74,102,130,0.45)");

      const dividerY = PRICEH;
      mainG.append("line")
        .attr("x1", ML)
        .attr("x2", ML + W)
        .attr("y1", dividerY)
        .attr("y2", dividerY)
        .attr("stroke", "rgba(89, 120, 153, 0.18)")
        .attr("stroke-width", 1);

      const lastVisible = currentVisible[currentVisible.length - 1]?.close;
      if (lastVisible != null && priceTagRef.current) {
        priceTagRef.current.style.top = `${currentYPrice(lastVisible)}px`;
        priceTagRef.current.style.display = "flex";
        priceTagRef.current.textContent = lastVisible >= 1000 ? lastVisible.toFixed(0) : lastVisible.toFixed(2);
      }
    };

    const zoom = d3.zoom()
      .scaleExtent([1, 40])
      .translateExtent([[ML, 0], [ML + W, H_total]])
      .extent([[ML, 0], [ML + W, H_total]])
      .on("zoom", (event) => {
        zoomTransformRef.current = event.transform;
        draw(event.transform);
      });

    zoomBehaviorRef.current = zoom;
    overlay.call(zoom);

    overlay.on("mousemove", function(event) {
      const [mx, my] = d3.pointer(event);
      if (mx < ML || mx > ML + W) return;

      crossG.style("display", null);
      crossG.select(".cx").attr("x1", mx).attr("x2", mx);

      const date = currentXScale.invert(mx);
      const bi = d3.bisector((d) => d.date).center;
      const idx = Math.min(Math.max(bi(currentVisible, date), 0), currentVisible.length - 1);
      const point = currentVisible[idx];
      if (!point) return;

      const px = currentXScale(point.date);
      const py = currentYPrice(point.close);
      const myMacd = point.MACD ?? 0;
      const pyMacd = currentYMacd(myMacd);

      crossG.select(".cx").attr("x1", px).attr("x2", px);
      crossG.select(".cy-price").attr("y1", py).attr("y2", py);
      crossG.select(".cy-macd").attr("y1", pyMacd).attr("y2", pyMacd);

      drawAxisLabel(xLabel, Math.max(ML, Math.min(px - 26, ML + W - 64)), H_total - 20, d3.timeFormat("%d %b %Y")(point.date), "#7bbdff");
      drawAxisLabel(yPriceLabel, ML + W + 8, py - 9, point.close?.toFixed(2) ?? "--", "#7bbdff");
      drawAxisLabel(yMacdLabel, ML + W + 8, pyMacd - 9, myMacd.toFixed(2), "#f5b34d");

      if (onCrosshair) onCrosshair(point);
    });

    overlay.on("mouseleave", function() {
      crossG.style("display", "none");
      if (onCrosshair) onCrosshair(null);
    });

    overlay.on("dblclick.zoom", null);
    overlay.on("dblclick", () => {
      zoomTransformRef.current = d3.zoomIdentity;
      svg.select("rect").call(zoom.transform, d3.zoomIdentity);
    });

    const preset = presetDomain(parsedData, rangePreset);
    if (preset) {
      const [start, end] = preset;
      const x0 = baseX(start);
      const x1 = baseX(end);
      const k = Math.max(1, Math.min(40, W / Math.max(8, x1 - x0)));
      const tx = ML - x0 * k;
      const nextTransform = d3.zoomIdentity.translate(tx, 0).scale(k);
      zoomTransformRef.current = nextTransform;
      overlay.call(zoom.transform, nextTransform);
    } else if (rangePreset === "ALL") {
      zoomTransformRef.current = d3.zoomIdentity;
      overlay.call(zoom.transform, d3.zoomIdentity);
    } else {
      draw(zoomTransformRef.current);
    }
  }, [data, showEMA, dims, onCrosshair, rangePreset, resetNonce]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
      <div ref={priceTagRef} className="price-tag-el" style={{ display: "none" }} />
    </div>
  );
}

function EquityMini({ equityCurve }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !equityCurve?.length) return;
    const el = ref.current;
    const W = el.parentElement?.clientWidth || 200;
    const H = 52;
    const svg = d3.select(el);
    svg.selectAll("*").remove();
    svg.attr("width", W).attr("height", H);

    const parsed = equityCurve.map((e) => ({ ...e, date: new Date(e.date) }));
    const x = d3.scaleTime().domain(d3.extent(parsed, (d) => d.date)).range([0, W]);
    const y = d3.scaleLinear().domain(d3.extent(parsed, (d) => d.equity)).nice().range([H - 3, 3]);
    const isPos = parsed[parsed.length - 1].equity >= parsed[0].equity;
    const c = isPos ? "#27c281" : "#ea5a64";

    svg.append("path")
      .datum(parsed)
      .attr("fill", isPos ? "rgba(39,194,129,0.08)" : "rgba(234,90,100,0.08)")
      .attr("d", d3.area().x((d) => x(d.date)).y0(H).y1((d) => y(d.equity)).curve(d3.curveMonotoneX));

    svg.append("path")
      .datum(parsed)
      .attr("fill", "none")
      .attr("stroke", c)
      .attr("stroke-width", 1.6)
      .attr("d", d3.line().x((d) => x(d.date)).y((d) => y(d.equity)).curve(d3.curveMonotoneX));
  }, [equityCurve]);

  return <svg ref={ref} className="eq-svg" />;
}

function StatCard({ label, value, cls }) {
  return (
    <div className="stat-card">
      <div className="stat-lbl">{label}</div>
      <div className={`stat-val ${cls || ""}`}>{value}</div>
    </div>
  );
}

function BacktestPanel({ result, label }) {
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

export default function App() {
  const [symbol, setSymbol] = useState("AAPL");
  const [trainStart, setTrainStart] = useState("2020-01-01");
  const [trainEnd, setTrainEnd] = useState("2024-12-31");
  const [testStart, setTestStart] = useState("2025-01-01");
  const [testEnd, setTestEnd] = useState("2026-02-28");
  const [interval, setInterval] = useState("1h");
  const [rr, setRr] = useState(1.5);
  const [swWindow, setSwWindow] = useState(8);
  const [mode, setMode] = useState("train");
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);
  const [crosshair, setCrosshair] = useState(null);
  const [showEMA, setShowEMA] = useState(true);
  const [backendOk, setBackendOk] = useState(null);
  const [rangePreset, setRangePreset] = useState("6M");
  const [chartResetNonce, setChartResetNonce] = useState(0);

  useEffect(() => {
    fetch("/health")
      .then((r) => r.json())
      .then((d) => setBackendOk(d.status === "ok"))
      .catch(() => setBackendOk(false));
  }, []);

  const activeData = useMemo(() => {
    if (!apiData) return null;
    return mode === "train" ? apiData.train.ohlcv : apiData.test.ohlcv;
  }, [apiData, mode]);

  const activeBacktest = useMemo(() => {
    if (!apiData) return null;
    return mode === "train" ? apiData.train.backtest : apiData.test.backtest;
  }, [apiData, mode]);

  const lastSignal = useMemo(() => {
    if (!activeData || !activeData.length) return 0;
    for (let i = activeData.length - 1; i >= 0; i -= 1) {
      if (activeData[i].pre_signal !== 0) return activeData[i].pre_signal;
    }
    return 0;
  }, [activeData]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        symbol,
        train_start: trainStart,
        train_end: trainEnd,
        test_start: testStart,
        test_end: testEnd,
        interval,
        rr,
        sw_window: swWindow,
      });
      const res = await fetch(`/api/data?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setApiData(data);
      setRangePreset("6M");
      setChartResetNonce((n) => n + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [symbol, trainStart, trainEnd, testStart, testEnd, interval, rr, swWindow]);

  const displayData = crosshair || (activeData ? activeData[activeData.length - 1] : null);
  const lastClose = activeData ? activeData[activeData.length - 1]?.close : 0;
  const prevClose = activeData && activeData.length > 1 ? activeData[activeData.length - 2]?.close : lastClose;
  const pChange = lastClose - prevClose;
  const pChangePct = prevClose ? (pChange / prevClose) * 100 : 0;
  const isUp = pChange >= 0;

  const signalMeta = {
    1: { label: "LONG SIGNAL", cls: "long" },
    [-1]: { label: "SHORT SIGNAL", cls: "short" },
    0: { label: "NO SIGNAL", cls: "neutral" },
  }[lastSignal] || { label: "NO SIGNAL", cls: "neutral" };

  const trainResult = apiData?.train?.backtest;
  const testResult = apiData?.test?.backtest;
  const retDiff = trainResult && testResult ? (testResult.totalReturn - trainResult.totalReturn).toFixed(1) : null;
  const hoveredDate = displayData?.date ? new Date(displayData.date) : null;
  const barsCount = activeData?.length || 0;

  return (
    <div className="app">
      <style>{STYLE}</style>

      <div className="shell">
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

        <div className="main">
          <div className="sidebar">
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

          <div className="chart-shell">
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

            <div className="charts-wrap">
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

              {loading && (
                <div className="loading-overlay">
                  <div className="spinner" />
                  <div className="loading-txt">Fetching {symbol} data from yfinance and computing strategy signals...</div>
                </div>
              )}

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

          <div className="sidebar-right">
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

            <div className="panel">
              <div className="panel-hd">
                <span className="panel-ttl">Train Backtest</span>
                <span className="split-label train">Train</span>
              </div>
              <div className="panel-bd">
                <BacktestPanel result={trainResult} label="train" />
              </div>
            </div>

            <div className="panel">
              <div className="panel-hd">
                <span className="panel-ttl">Test Backtest</span>
                <span className="split-label test">Test</span>
              </div>
              <div className="panel-bd">
                <BacktestPanel result={testResult} label="test" />
              </div>
            </div>

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
        </div>
      </div>

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
    </div>
  );
}
