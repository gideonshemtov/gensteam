const test = require('node:test');
const assert = require('node:assert/strict');

const ButtonPanel = require('../js/ButtonPanel');

test('clicking a command button sends the command and refocuses the game input', () => {
  const input = {
    value: 'half typed',
    focusCalls: 0,
    selection: null,
    focus() { this.focusCalls += 1; },
    setSelectionRange(start, end) { this.selection = [start, end]; },
  };
  const sent = [];

  global.document = { getElementById: (id) => (id === 'input' ? input : null) };
  global.window = {
    sendCommand: (command, options) => {
      sent.push({ command, options });
      return true;
    },
  };

  try {
    const panel = new ButtonPanel();
    panel.handleButtonClick({ command: 'look' });

    assert.deepEqual(sent.map((entry) => entry.command), ['look']);
    assert.equal(input.focusCalls, 1);
    assert.deepEqual(input.selection, [input.value.length, input.value.length]);
  } finally {
    delete global.document;
    delete global.window;
  }
});

test('clicking a command button still works when the game input is missing', () => {
  const sent = [];
  global.document = { getElementById: () => null };
  global.window = {
    sendCommand: (command) => {
      sent.push(command);
      return true;
    },
  };

  try {
    const panel = new ButtonPanel();
    assert.doesNotThrow(() => panel.handleButtonClick({ command: 'who' }));
    assert.deepEqual(sent, ['who']);
  } finally {
    delete global.document;
    delete global.window;
  }
});
