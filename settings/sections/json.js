// settings/sections/json.js - Raw JSON settings editor section.
window.GenesisSettings.register({
  id: 'json',
  title: 'Edit JSON',
  icon: '📝',
  containerClass: 'json-editor-container',
  template: `
    <div class="json-editor-header">
      <div>
        <strong>Edit Settings JSON</strong>
        <div style="font-size: 12px; color: #999; margin-top: 2px;">
          Direct editing of the settings file. Be careful with syntax!
        </div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn secondary" id="importBtn">Import</button>
        <button class="btn secondary" id="exportBtn">Export</button>
        <button class="btn" id="saveJsonBtn">Save JSON</button>
      </div>
    </div>
    <textarea class="json-editor" id="jsonEditor" placeholder="Loading settings..."></textarea>
  `,
  setup(root, ctx) {
    root.querySelector('#saveJsonBtn').addEventListener('click', () => ctx.saveJson());
    root.querySelector('#exportBtn').addEventListener('click', () => ctx.exportSettings());
    root.querySelector('#importBtn').addEventListener('click', () => ctx.importSettings());
  },
});
