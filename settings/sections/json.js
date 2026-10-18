// settings/sections/json.js - Raw JSON settings editor section.
window.GenesisSettings.register({
  id: 'json',
  title: 'Edit JSON',
  icon: '📝',
  containerClass: 'json-editor-container',
  partial: 'json',
  setup(root, ctx) {
    root.querySelector('#saveJsonBtn').addEventListener('click', () => ctx.saveJson());
    root.querySelector('#exportBtn').addEventListener('click', () => ctx.exportSettings());
    root.querySelector('#importBtn').addEventListener('click', () => ctx.importSettings());
  },
});
