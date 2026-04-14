export const STYLE = `
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
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 6px;
    scrollbar-gutter: stable;
  }

  .panel {
    background: linear-gradient(180deg, rgba(16, 26, 38, 0.98), rgba(12, 20, 31, 0.98));
    border: 1px solid var(--border);
    border-radius: var(--rl);
    overflow: hidden;
    box-shadow: var(--shadow);
    backdrop-filter: blur(12px);
    flex-shrink: 0;
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
