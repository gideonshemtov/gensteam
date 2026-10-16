// PageToast.js - reusable, on-screen toast for the game window.
// Injected into the page as window.pageToast; used for the zoom indicator and
// available for any other transient message. Styles are applied via the CSSOM
// (element.style) so the game page's Content-Security-Policy cannot block them.
const TOAST_ID = '__genesis_page_toast';

const TOAST_VARIANTS = {
  default: 'rgba(20, 20, 20, 0.85)',
  success: 'rgba(21, 87, 36, 0.9)',
  error: 'rgba(120, 25, 25, 0.9)',
};

function createPageToast(win, doc) {
  function ensureToast() {
    let toast = doc.getElementById(TOAST_ID);
    if (!toast) {
      toast = doc.createElement('div');
      toast.id = TOAST_ID;
      toast.style.cssText =
        'position:fixed;top:12px;right:12px;z-index:2147483647;' +
        'background:rgba(20,20,20,0.85);color:#fff;padding:6px 14px;border-radius:8px;' +
        'border:1px solid rgba(255,255,255,0.25);font:600 14px system-ui,-apple-system,sans-serif;' +
        'box-shadow:0 2px 10px rgba(0,0,0,0.4);transition:opacity 0.3s ease;opacity:0;' +
        'pointer-events:none;user-select:none;';
      doc.documentElement.appendChild(toast);
    }
    return toast;
  }

  return function pageToast(message, options = {}) {
    const toast = ensureToast();
    toast.textContent = String(message);
    toast.style.background = TOAST_VARIANTS[options.variant] || TOAST_VARIANTS.default;
    toast.style.opacity = '1';

    clearTimeout(win.__genesisToastTimer);
    win.__genesisToastTimer = setTimeout(() => {
      toast.style.opacity = '0';
    }, options.duration || 1200);
  };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.pageToast = createPageToast(window, document);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = createPageToast;
}
