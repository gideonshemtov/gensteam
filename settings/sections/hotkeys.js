// settings/sections/hotkeys.js - Keyboard hotkey configuration section.
(function () {
  function showWarning(warning, message) {
    warning.textContent = message;
    warning.style.display = 'block';
  }

  function hideWarning(warning) {
    warning.textContent = '';
    warning.style.display = 'none';
  }

  async function recordHotkey(event, binding, keysInput, warning, ctx) {
    if (!ctx.api?.hotkeys?.record) {
      showWarning(warning, 'Hotkey recording is not available.');
      return;
    }

    let result = null;
    try {
      result = await ctx.api.hotkeys.record({
        key: event.key,
        control: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey,
      });
    } catch {
      result = null;
    }

    if (!result) {
      showWarning(warning, 'That key is not supported. Try a function key, or a letter/number with a modifier.');
      return;
    }
    if (!result.safe) {
      showWarning(warning, 'Include Ctrl/Cmd/Alt, or use a function or navigation key, so normal typing is not intercepted.');
      return;
    }

    binding.keys = result.keys;
    keysInput.value = result.keys;
    hideWarning(warning);
    ctx.markChanged();
    ctx.syncJson();
  }

  function createHotkeyEditorRow(binding, index, root, ctx) {
    const row = document.createElement('div');
    row.className = 'hotkey-edit-item';

    const warning = document.createElement('div');
    warning.className = 'hotkey-warning';
    warning.style.display = 'none';

    const keysInput = document.createElement('input');
    keysInput.type = 'text';
    keysInput.readOnly = true;
    keysInput.className = 'setting-input hotkey-keys-input';
    keysInput.placeholder = 'Click, then press keys';
    keysInput.title = 'Click and press a key combination';
    keysInput.value = binding.keys ?? '';

    keysInput.addEventListener('focus', () => {
      keysInput.classList.add('recording');
      keysInput.placeholder = 'Press keys...';
    });
    keysInput.addEventListener('blur', () => {
      keysInput.classList.remove('recording');
      keysInput.placeholder = 'Click, then press keys';
    });
    keysInput.addEventListener('keydown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      recordHotkey(event, binding, keysInput, warning, ctx);
    });

    const commandInput = document.createElement('input');
    commandInput.type = 'text';
    commandInput.className = 'setting-input hotkey-command-input';
    commandInput.placeholder = 'Command to send (e.g. look)';
    commandInput.value = binding.command ?? '';
    commandInput.addEventListener('input', () => {
      binding.command = commandInput.value;
      ctx.markChanged();
      ctx.syncJson();
    });

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'btn danger';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      const bindings = ctx.settings.hotkeys?.bindings;
      if (!Array.isArray(bindings)) return;
      bindings.splice(index, 1);
      ctx.markChanged();
      populateHotkeyList(root, ctx);
      ctx.syncJson();
    });

    row.append(keysInput, commandInput, removeButton, warning);
    return row;
  }

  function populateHotkeyList(root, ctx) {
    const list = root.querySelector('#hotkeyList');
    if (!list) return;

    const bindings = ctx.settings.hotkeys?.bindings || [];
    list.textContent = '';

    if (bindings.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'hotkey-editor-empty';
      empty.textContent = 'No hotkeys yet. Click "Add Hotkey" to create one.';
      list.appendChild(empty);
      return;
    }

    bindings.forEach((binding, index) => {
      list.appendChild(createHotkeyEditorRow(binding, index, root, ctx));
    });
  }

  window.GenesisSettings.register({
    id: 'hotkeys',
    title: 'Hotkeys',
    icon: '⌨️',
    partial: 'hotkeys',
    setup(root, ctx) {
      root.querySelector('#addHotkeyBtn').addEventListener('click', () => {
        if (!ctx.settings.hotkeys) {
          ctx.settings.hotkeys = { enabled: true, bindings: [] };
        }
        if (!Array.isArray(ctx.settings.hotkeys.bindings)) {
          ctx.settings.hotkeys.bindings = [];
        }

        ctx.settings.hotkeys.bindings.push({ keys: '', command: '' });
        ctx.markChanged();
        populateHotkeyList(root, ctx);

        const inputs = root.querySelectorAll('.hotkey-keys-input');
        if (inputs.length > 0) {
          inputs[inputs.length - 1].focus();
        }

        ctx.syncJson();
      });
    },
    populate(root, ctx) {
      populateHotkeyList(root, ctx);
    },
    beforeSave(settings) {
      // Drop half-finished hotkeys (no key recorded yet) so they never persist.
      if (Array.isArray(settings.hotkeys?.bindings)) {
        settings.hotkeys.bindings = settings.hotkeys.bindings.filter(
          (binding) => binding && typeof binding.keys === 'string' && binding.keys.trim() !== '',
        );
      }
    },
  });
})();
