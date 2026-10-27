// CommandSender.js - shared logic for sending a command to the MUD client.
// Injected into the game page as window.sendCommand and used by ButtonPanel,
// HotkeyManager and TimerManager so the send-path priority lives in one place.
function sendCommand(command, options = {}) {
  const {
    logPrefix = 'Command',
    restoreInput = false,
    recordHistory = false,
  } = options;

  // Preferred: the bridge injected by WebClientHook.js uses the official
  // client's own command path, so the player's JavaScript aliases run and the
  // client handles echo/output itself.
  if (typeof window !== 'undefined' && window.genesisClient) {
    const bridge = window.genesisClient;
    const send = recordHistory && typeof bridge.sendTyped === 'function'
      ? bridge.sendTyped
      : bridge.send;

    if (typeof send === 'function') {
      console.log(`${logPrefix} via Genesis client bridge`);
      try {
        send.call(bridge, command);
        return true;
      } catch (error) {
        console.warn('Genesis client bridge send failed, falling back:', error);
      }
    }
  }

  // Raw WebSocket path. It does not run client aliases, but it is the most
  // reliable fallback if the page was not patched.
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
