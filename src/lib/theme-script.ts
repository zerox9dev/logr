/** Kept apart from theme.ts, a client module, so a server layout can inline it. */
export const THEME_KEY = "logr-theme";

/** Inline in <head>, render-blocking: sets data-theme before /app paints. Other
 *  pages keep no theme — client navigation is handled by the app shell. */
export const THEME_SCRIPT = `(function(){try{if(!/^\\/app(\\/|$)/.test(location.pathname))return;var p=localStorage.getItem("${THEME_KEY}");var d=p==="dark"||(p!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light"}catch(e){}})()`;
