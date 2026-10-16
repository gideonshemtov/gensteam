// CommandSender.js - shared logic for sending a command to the MUD client.
// Injected into the game page as window.sendCommand and used by ButtonPanel
// and TimerManager so the MUD-API/input-field fallback lives in one place.
function sendCommand(command, options = {}) {
  const { logPrefix = 'Command', restoreInput = false } = options;

  // Prefer the MUD Connector API when available.
  if (typeof window !== 'undefined' && window.mudAPI && window.mudAPI.send) {
    console.log(`${logPrefix} via MUD Connector`);
    const success = window.mudAPI.send(command);
    if (success) {
      return true;
    }
    console.warn('MUD Connector send failed, falling back to input method');
  }

  // Fall back to the input field method.
  const input = document.getElementById('input');
  if (!input) {
    return false;
  }

  console.log(`${logPrefix} via input field`);
  const currentValue = input.value;
  input.value = command;
  input.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true,
  }));

  // Timers restore the user's in-progress input; buttons do not.
  if (restoreInput) {
    setTimeout(() => {
      if (input.value === command) {
        input.value = currentValue;
      }
    }, 100);
  }

  return true;
}

if (typeof window !== 'undefined') {
  window.sendCommand = sendCommand;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = sendCommand;
}
