// ZoomController.js - shared zoom logic for menu, shortcuts, and Ctrl+wheel.
const MIN_ZOOM = -5;
const MAX_ZOOM = 5;

// Each step is a 20% * 0.5 = ~9.5% change, which feels smoother than a full level.
const ZOOM_STEP = 0.5;

function clampZoom(level) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level));
}

// Electron maps zoom levels to a factor of 1.2^level (level 0 = 100%).
function zoomPercent(level) {
  return Math.round(Math.pow(1.2, level) * 100);
}

// Apply a zoom level to a window's web contents and return the clamped value.
function applyZoom(win, level) {
  const clamped = clampZoom(level);
  if (win && !win.isDestroyed?.()) {
    win.webContents.setZoomLevel(clamped);
  }
  return clamped;
}

// Apply and remember a zoom level. Persists without notifying so the renderer
// does not re-render just because the text size changed.
function setZoom(settingsManager, win, level) {
  const clamped = applyZoom(win, level);
  if (settingsManager.get('ui.zoomLevel') !== clamped) {
    settingsManager.set('ui.zoomLevel', clamped, { notify: false });
  }
  return clamped;
}

function stepZoom(settingsManager, win, delta) {
  const current = settingsManager.get('ui.zoomLevel') ?? 0;
  return setZoom(settingsManager, win, current + delta);
}

module.exports = { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP, clampZoom, zoomPercent, applyZoom, setZoom, stepZoom };
