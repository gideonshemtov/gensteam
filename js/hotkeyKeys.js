// hotkeyKeys.js - parse, normalise and match configurable hotkeys.
//
// Hotkeys are stored as strings such as "F1", "Ctrl+1" or "Cmd+Shift+K". This
// module is the single source of truth for turning a raw keydown descriptor
// ({ key, control, alt, shift, meta }) into that canonical form, and for
// matching a stored hotkey against a descriptor. The main process uses it when
// dispatching hotkeys; the preferences window uses it (over IPC) so the
// recorder produces identical strings.

// Modifier aliases accepted when reading hotkeys from settings. The recorder
// always writes the canonical tokens (Ctrl, Cmd, Alt, Shift); the extras let
// hand-edited settings use Electron-style names such as CommandOrControl.
const MODIFIER_ALIASES = {
  cmdorctrl: 'CmdOrCtrl',
  commandorcontrol: 'CmdOrCtrl',
  cmd: 'Cmd',
  command: 'Cmd',
  meta: 'Cmd',
  super: 'Cmd',
  ctrl: 'Ctrl',
  control: 'Ctrl',
  alt: 'Alt',
  option: 'Alt',
  shift: 'Shift',
};

const NAMED_KEYS = {
  ' ': 'Space',
  space: 'Space',
  spacebar: 'Space',
  esc: 'Escape',
  escape: 'Escape',
  enter: 'Enter',
  return: 'Enter',
  tab: 'Tab',
  backspace: 'Backspace',
  back: 'Backspace',
  delete: 'Delete',
  del: 'Delete',
  insert: 'Insert',
  ins: 'Insert',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pgup: 'PageUp',
  pagedown: 'PageDown',
  pgdn: 'PageDown',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  arrowup: 'Up',
  arrowdown: 'Down',
  arrowleft: 'Left',
  arrowright: 'Right',
};

// Bare keys (no modifier) that will not interfere with typing in the game.
// Shift alone does not count as a modifier here: Shift+A is still typing.
const SAFE_BARE_KEYS = new Set([
  'Escape',
  'Up',
  'Down',
  'Left',
  'Right',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  'Insert',
  'Delete',
  ...Array.from({ length: 24 }, (_unused, index) => `F${index + 1}`),
]);

// Canonical modifier output order.
const MODIFIER_ORDER = ['Ctrl', 'Cmd', 'Alt', 'Shift'];

// Turn a single key name (from KeyboardEvent.key or a settings string) into its
// canonical form, or null when it is not a key we can bind.
function canonicalKeyName(raw) {
  if (typeof raw !== 'string' || raw.length === 0) {
    return null;
  }
  if (raw === ' ') {
    return 'Space';
  }
  if (raw.length === 1) {
    return raw.toUpperCase();
  }
  if (/^f([1-9]|1[0-9]|2[0-4])$/i.test(raw)) {
    return `F${raw.slice(1)}`;
  }
  return NAMED_KEYS[raw.toLowerCase()] || null;
}

function resolvePrimaryModifier(token, platform) {
  if (token === 'CmdOrCtrl') {
    return platform === 'darwin' ? 'Cmd' : 'Ctrl';
  }
  return token;
}

// Build the canonical hotkey for a keydown descriptor, e.g. { key: 'k',
// control: true, shift: true } -> "Ctrl+Shift+K". Returns null for keys we
// cannot bind (modifier-only presses, IME/caps-lock keys, ...).
function formatHotkey(descriptor) {
  if (!descriptor || typeof descriptor !== 'object') {
    return null;
  }
  const keyName = canonicalKeyName(descriptor.key);
  if (!keyName) {
    return null;
  }

  const modifiers = [];
  if (descriptor.control) modifiers.push('Ctrl');
  if (descriptor.meta) modifiers.push('Cmd');
  if (descriptor.alt) modifiers.push('Alt');
  if (descriptor.shift) modifiers.push('Shift');

  return [...modifiers, keyName].join('+');
}

// Normalise a stored hotkey string (resolving aliases and ordering modifiers),
// or null when it cannot be parsed.
function normalizeHotkey(keys, platform = process.platform) {
  if (typeof keys !== 'string') {
    return null;
  }
  const parts = keys.split('+').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    return null;
  }

  const keyName = canonicalKeyName(parts[parts.length - 1]);
  if (!keyName) {
    return null;
  }

  const modifiers = new Set();
  for (const part of parts.slice(0, -1)) {
    const alias = MODIFIER_ALIASES[part.toLowerCase()];
    if (!alias) {
      return null;
    }
    modifiers.add(resolvePrimaryModifier(alias, platform));
  }

  const ordered = MODIFIER_ORDER.filter((modifier) => modifiers.has(modifier));
  return [...ordered, keyName].join('+');
}

// A hotkey is safe to dispatch when it cannot interrupt ordinary typing: it has
// a non-Shift modifier (Ctrl/Cmd/Alt) or is a function/navigation key.
function isSafeHotkey(keys, platform = process.platform) {
  const normalized = normalizeHotkey(keys, platform);
  if (!normalized) {
    return false;
  }
  const parts = normalized.split('+');
  const keyName = parts[parts.length - 1];
  const nonShiftModifiers = parts.slice(0, -1).filter((modifier) => modifier !== 'Shift');
  return nonShiftModifiers.length > 0 || SAFE_BARE_KEYS.has(keyName);
}

// Does a stored hotkey match a keydown descriptor?
function matchesHotkey(keys, descriptor, platform = process.platform) {
  const normalized = normalizeHotkey(keys, platform);
  if (!normalized) {
    return false;
  }
  return normalized === formatHotkey(descriptor);
}

module.exports = {
  formatHotkey,
  normalizeHotkey,
  isSafeHotkey,
  matchesHotkey,
  canonicalKeyName,
};
