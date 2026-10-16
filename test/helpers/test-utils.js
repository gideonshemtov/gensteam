// Shared test helpers.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Depth-first search for a menu item by label (recurses into submenus).
function findMenuItem(template, label) {
  for (const item of template) {
    if (item.label === label) return item;
    if (item.submenu) {
      const found = findMenuItem(item.submenu, label);
      if (found) return found;
    }
  }
  return null;
}

// In-memory stand-in for SettingsManager that supports path-based get/set.
function fakeSettings(initialSettings) {
  let settings = JSON.parse(JSON.stringify(initialSettings));
  const subscribers = new Set();

  return {
    get(path) {
      return path ? path.split('.').reduce((value, key) => value?.[key], settings) : settings;
    },
    set(path, value, options = {}) {
      const keys = path.split('.');
      let current = settings;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      if (options.notify !== false) {
        for (const subscriber of subscribers) subscriber(settings);
      }
      return value;
    },
    subscribe(callback) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
  };
}

// Mute console methods for the duration of a test file. Returns a restore fn.
function muteConsole(methods = ['log', 'warn', 'error']) {
  const originals = {};
  for (const method of methods) {
    originals[method] = console[method];
    console[method] = () => {};
  }
  return () => {
    for (const method of methods) {
      console[method] = originals[method];
    }
  };
}

// Create a temp directory and register its cleanup on a node:test context.
function tempDir(t, prefix = 'gensteam-') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

module.exports = { findMenuItem, fakeSettings, muteConsole, tempDir };
