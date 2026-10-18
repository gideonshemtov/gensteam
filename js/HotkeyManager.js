// HotkeyManager.js - dispatch configurable keyboard shortcuts to the MUD.
//
// Hotkeys only fire while the game window is focused: `before-input-event`
// fires on the game's webContents, so the preferences window (a separate,
// modal window) can never trigger a binding. A matching key is consumed with
// preventDefault so it does not also reach the page (or a menu accelerator).
const { matchesHotkey, isSafeHotkey } = require('./hotkeyKeys');

class HotkeyManager {
  constructor(settingsManager) {
    this.settingsManager = settingsManager;
    this.win = null;
    this.handler = null;
  }

  attach(win) {
    this.detach();
    if (!win || win.isDestroyed?.()) {
      return;
    }
    this.win = win;
    this.handler = (event, input) => this.handleInput(event, input);
    win.webContents.on('before-input-event', this.handler);
  }

  detach() {
    if (this.win && this.handler && !this.win.isDestroyed?.()) {
      this.win.webContents.removeListener?.('before-input-event', this.handler);
    }
    this.win = null;
    this.handler = null;
  }

  handleInput(event, input) {
    if (!input || input.type !== 'keyDown' || input.isAutoRepeat || input.isComposing) {
      return;
    }

    const hotkeys = this.settingsManager.get()?.hotkeys;
    if (!hotkeys || hotkeys.enabled === false) {
      return;
    }

    const bindings = Array.isArray(hotkeys.bindings) ? hotkeys.bindings : [];
    const binding = bindings.find(
      (candidate) =>
        candidate &&
        typeof candidate.keys === 'string' &&
        isSafeHotkey(candidate.keys) &&
        matchesHotkey(candidate.keys, input),
    );

    // Only consume the key once we know there is something to run.
    if (binding && this.runBinding(binding)) {
      event.preventDefault();
    }
  }

  runBinding(binding) {
    if (binding.action && binding.action !== 'command') {
      return false;
    }
    return this.sendCommand(binding.command);
  }

  sendCommand(command) {
    const text = typeof command === 'string' ? command.trim() : '';
    if (!text || !this.win || this.win.isDestroyed?.()) {
      return false;
    }

    const logPrefix = `⌨️ Hotkey "${text}"`;
    this.win.webContents
      .executeJavaScript(`
        (function () {
          if (typeof window.sendCommand === 'function') {
            window.sendCommand(${JSON.stringify(text)}, { logPrefix: ${JSON.stringify(logPrefix)} });
          }
        })();
      `)
      .catch(() => {
        // Ignore if the page is not ready or the window is gone.
      });

    return true;
  }
}

module.exports = HotkeyManager;
