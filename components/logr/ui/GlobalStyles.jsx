export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      input, select { background: transparent; border: none; outline: none; font-family: inherit; }
      .row:hover .del { opacity: 1 !important; }
      .client-tab:hover { opacity: 1 !important; }
      @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
      .blink { animation: pulse 1.2s ease-in-out infinite; }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-thumb { background: #333; }
      @media (max-width: 600px) {
        .sidebar { display: none !important; }
        .sidebar.mobile-open { display: flex !important; position: fixed; top: 0; left: 0; width: 80vw; height: 100vh; z-index: 100; }
        .main-area { padding: 20px 16px !important; }
        .mobile-bar { display: flex !important; }
      }
      @media (min-width: 601px) {
        .mobile-bar { display: none !important; }
        .sidebar { display: flex !important; }
      }
    `}</style>
  );
}
