export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .logr-app { font-family: 'Inter Tight', sans-serif; }
      .logr-app input,
      .logr-app select,
      .logr-app button,
      .logr-app textarea { font-family: inherit; }
      .logr-app button { border-radius: 4px; }
      input, select { background: transparent; border: none; outline: none; font-family: inherit; }
      .row:hover .del { opacity: 1 !important; }
      .client-tab:hover { opacity: 1 !important; }
      @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
      .blink { animation: pulse 1.2s ease-in-out infinite; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 999px; }
      ::-webkit-scrollbar-track { background: transparent; }
      @media (max-width: 600px) {
        .sidebar { display: none !important; }
        .sidebar.mobile-open { display: flex !important; position: fixed; top: 0; left: 0; width: 80vw; height: 100vh; z-index: 100; }
        .main-area { padding: 20px 16px !important; width: 100% !important; max-width: 100% !important; }
        .mobile-bar { display: flex !important; }
        .timer-value { font-size: 44px !important; }
        .task-top-row { flex-wrap: wrap; }
        .task-date-box { width: 100% !important; }
        .task-rate-box { width: 100% !important; }
        .task-action-row { flex-direction: column; }
        .manual-top-row { flex-wrap: wrap; }
        .manual-date-box { width: 100% !important; }
        .manual-metrics-row { flex-wrap: wrap; }
        .manual-metrics-row > div { min-width: calc(50% - 4px); }
        .session-row { flex-direction: column !important; align-items: stretch !important; gap: 6px !important; }
        .session-main { width: 100% !important; align-items: flex-start !important; }
        .session-meta { width: 100% !important; flex-wrap: wrap; gap: 8px !important; padding-left: 64px; }
        .session-notes { white-space: normal; overflow-wrap: anywhere; word-break: break-word; }
        .stats-row { flex-wrap: wrap; gap: 8px !important; }
        .stats-row > div { min-width: calc(50% - 4px); }
        .export-row { flex-direction: column; }
      }
      @media (min-width: 601px) {
        .mobile-bar { display: none !important; }
        .sidebar { display: flex !important; }
      }
    `}</style>
  );
}
