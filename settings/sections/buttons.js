// settings/sections/buttons.js - Custom button configuration section.
(function () {
  // Only accept well-formed hex colors; anything else falls back to a neutral grey.
  function getSafeColor(color) {
    return typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#888888';
  }

  function createButtonEditorRow(button, index, root, ctx) {
    const row = document.createElement('div');
    row.className = 'button-edit-item';

    const preview = document.createElement('div');
    preview.className = 'button-preview';
    const applyPreview = () => {
      const color = getSafeColor(button.color);
      preview.style.background = color;
      preview.style.border = `1px solid ${color}`;
      preview.textContent = button.icon ?? '';
    };

    const fields = document.createElement('div');
    fields.className = 'button-edit-fields';

    const addField = (name, labelText, value, type, onInput) => {
      const label = document.createElement('label');
      label.className = `button-edit-field ${name}-field`;

      const caption = document.createElement('span');
      caption.textContent = labelText;

      const input = document.createElement('input');
      input.type = type;
      input.className = 'setting-input';
      input.value = value ?? '';
      input.addEventListener('input', () => {
        onInput(input.value);
        applyPreview();
        ctx.markChanged();
        ctx.syncJson();
      });

      label.append(caption, input);
      return label;
    };

    // Keep a canonical (safe) hex value in the model for the color input.
    if (button.color !== getSafeColor(button.color)) {
      button.color = getSafeColor(button.color);
    }

    fields.append(
      addField('icon', 'Icon', button.icon, 'text', (value) => { button.icon = value; }),
      addField('title', 'Title', button.title, 'text', (value) => { button.title = value; }),
      addField('command', 'Command', button.command, 'text', (value) => { button.command = value; }),
      addField('color', 'Color', button.color, 'color', (value) => { button.color = value; }),
    );

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'btn danger button-remove';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      const buttons = ctx.settings.buttons?.customButtons;
      if (!Array.isArray(buttons)) return;
      buttons.splice(index, 1);
      ctx.markChanged();
      populateButtonList(root, ctx);
      ctx.syncJson();
    });

    applyPreview();
    row.append(preview, fields, removeButton);
    return row;
  }

  function populateButtonList(root, ctx) {
    const buttonList = root.querySelector('#buttonList');
    if (!buttonList) return;

    const buttons = ctx.settings.buttons?.customButtons || [];
    buttonList.textContent = '';

    if (buttons.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'button-editor-empty';
      empty.textContent = 'No custom buttons yet. Click "Add Button" to create one.';
      buttonList.appendChild(empty);
      return;
    }

    buttons.forEach((button, index) => {
      buttonList.appendChild(createButtonEditorRow(button, index, root, ctx));
    });
  }

  window.GenesisSettings.register({
    id: 'buttons',
    title: 'Custom Buttons',
    icon: '🔘',
    template: `
      <div class="setting-group">
        <div class="setting-group-title">Custom Buttons</div>

        <div class="setting-item">
          <label class="setting-label">Show Tooltips</label>
          <div class="setting-description">Show tooltips when hovering over buttons</div>
          <input type="checkbox" class="setting-input setting-checkbox" data-path="buttons.showTooltips">
        </div>

        <div class="setting-item">
          <label class="setting-label">Custom Buttons Configuration</label>
          <div class="setting-description">Add, edit, and remove the quick-action buttons shown in the game window. Changes are applied when you save.</div>
          <div class="button-editor" id="buttonList"></div>
          <button type="button" class="btn secondary" id="addButtonBtn" style="margin-top: 10px;">+ Add Button</button>
        </div>
      </div>
    `,
    setup(root, ctx) {
      root.querySelector('#addButtonBtn').addEventListener('click', () => {
        if (!ctx.settings.buttons) {
          ctx.settings.buttons = {};
        }
        if (!Array.isArray(ctx.settings.buttons.customButtons)) {
          ctx.settings.buttons.customButtons = [];
        }

        ctx.settings.buttons.customButtons.push({
          icon: '⭐',
          title: 'New Button',
          command: 'look',
          color: '#4a90e2',
        });

        ctx.markChanged();
        populateButtonList(root, ctx);
        ctx.syncJson();
      });
    },
    populate(root, ctx) {
      populateButtonList(root, ctx);
    },
  });
})();
