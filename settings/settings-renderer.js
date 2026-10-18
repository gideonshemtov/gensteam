// settings/settings-renderer.js
//
// Shell for the preferences window. It builds the sidebar and section panels
// from the section registry (settings/sections/*.js), owns the settings model
// (load/save/reset/import/export), and handles the cross-section pieces: the
// generic data-path form binding, the JSON editor, search, and messages.
//
// Each section owns its own markup and dynamic lists; the shell hands it a
// context object with helpers instead of exposing the whole renderer.

// Parse a section's static markup into importable nodes. DOMParser is used
// rather than assigning raw markup, so section templates are never set as HTML
// strings; settings values are always applied afterwards via value/textContent.
function parseTemplate(markup) {
  const parsed = new DOMParser().parseFromString(`<div>${markup}</div>`, 'text/html');
  const wrapper = parsed.body.firstElementChild;
  if (!wrapper) {
    return [];
  }
  return Array.from(wrapper.childNodes).map((node) => document.importNode(node, true));
}

class SettingsRenderer {
  constructor() {
    this.currentSettings = {};
    this.originalSettings = {};
    this.currentSection = null;
    this.hasUnsavedChanges = false;
    this.sections = [];

    const self = this;
    this.ctx = {
      get settings() { return self.currentSettings; },
      markChanged: () => self.markAsChanged(),
      syncJson: () => self.syncJsonEditor(),
      showError: (message) => self.showError(message),
      showSuccess: (message) => self.showSuccess(message),
      saveJson: () => self.saveJsonSettings(),
      exportSettings: () => self.exportSettings(),
      importSettings: () => self.importSettings(),
      api: window.electronAPI,
    };

    this.init();
  }

  async init() {
    await this.buildSections();
    this.setupEventListeners();
    await this.loadSettings();
    this.populateUI();
    this.setupSearch();
  }

  async buildSections() {
    const contentBody = document.getElementById('contentBody');
    const sidebarSections = document.getElementById('sidebarSections');
    const registry = window.GenesisSettings?.sections || [];

    this.sections = [];

    for (const definition of registry) {
      const panel = document.createElement('div');
      panel.className = `settings-panel ${definition.containerClass || 'settings-section'}`;
      panel.dataset.section = definition.id;
      for (const node of parseTemplate(await this.loadPartial(definition))) {
        panel.appendChild(node);
      }
      contentBody.appendChild(panel);

      const item = document.createElement('div');
      item.className = 'sidebar-item';
      item.dataset.section = definition.id;

      const icon = document.createElement('span');
      icon.className = 'sidebar-item-icon';
      icon.textContent = definition.icon || '';

      item.append(icon, document.createTextNode(` ${definition.title || definition.id}`));
      item.addEventListener('click', () => this.switchSection(definition.id));
      sidebarSections.appendChild(item);

      definition.setup?.(panel, this.ctx);
      this.sections.push({ definition, panel });
    }

    if (this.sections.length > 0) {
      this.switchSection(this.sections[0].definition.id);
    }
  }

  // Section markup lives in settings/sections/<name>.html. The renderer is
  // sandboxed, so the main process reads the file and returns its text.
  async loadPartial(definition) {
    const name = definition.partial || definition.id;
    try {
      const markup = await window.electronAPI?.getPartial?.(name);
      return typeof markup === 'string' ? markup : '';
    } catch {
      return '';
    }
  }

  setupEventListeners() {
    // Save button
    document.getElementById('saveBtn').addEventListener('click', () => {
      this.saveSettings();
    });

    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
      this.cancelSettings();
    });

    // Reset all button
    document.getElementById('resetAllBtn').addEventListener('click', () => {
      this.showResetModal();
    });

    // Reset modal
    document.getElementById('cancelResetBtn').addEventListener('click', () => {
      this.hideResetModal();
    });

    document.getElementById('confirmResetBtn').addEventListener('click', () => {
      this.resetAllSettings();
    });

    // Setting inputs change detection
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('setting-input')) {
        this.handleSettingChange(e.target);
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('setting-input')) {
        this.handleSettingChange(e.target);
      }
    });

    // Handle close request from main process
    if (window.electronAPI && window.electronAPI.onCloseRequested) {
      window.electronAPI.onCloseRequested(() => {
        this.handleWindowCloseRequest();
      });
    }

    // Prevent accidental window close with unsaved changes
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  async loadSettings() {
    try {
      if (!window.electronAPI?.settings?.get) {
        throw new Error('Settings API is not available. The preload script may have failed to load.');
      }
      this.currentSettings = await window.electronAPI.settings.get();
      this.originalSettings = JSON.parse(JSON.stringify(this.currentSettings));
    } catch (error) {
      this.showError('Failed to load settings: ' + error.message);
    }
  }

  // Populate the generic data-path inputs and then let each section refresh its
  // own dynamic content (lists, derived labels, ...).
  populateUI() {
    document.querySelectorAll('.setting-input').forEach((input) => {
      const path = input.dataset.path;
      if (!path) return;

      const value = this.getNestedValue(this.currentSettings, path);
      if (input.type === 'checkbox') {
        input.checked = Boolean(value);
      } else {
        input.value = value ?? '';
      }
    });

    for (const { definition, panel } of this.sections) {
      definition.populate?.(panel, this.ctx);
    }

    this.updateJsonEditor();
  }

  updateJsonEditor() {
    const editor = document.getElementById('jsonEditor');
    if (editor) {
      editor.value = JSON.stringify(this.currentSettings, null, 2);
    }
  }

  // Keep the JSON editor in sync unless the user is currently editing it.
  syncJsonEditor() {
    if (this.currentSection !== 'json') {
      this.updateJsonEditor();
    }
  }

  switchSection(section) {
    document.querySelectorAll('#sidebarSections .sidebar-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.section === section);
    });

    document.querySelectorAll('#contentBody .settings-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.section === section);
    });

    this.currentSection = section;

    // Update JSON editor when switching to JSON section
    if (section === 'json') {
      this.updateJsonEditor();
    }
  }

  handleSettingChange(input) {
    const path = input.dataset.path;
    if (!path) return;

    let value;
    if (input.type === 'checkbox') {
      value = input.checked;
    } else if (input.type === 'number') {
      value = parseInt(input.value, 10);
    } else if (input.type === 'range') {
      value = parseFloat(input.value);
    } else {
      value = input.value;
    }

    this.setNestedValue(this.currentSettings, path, value);
    this.markAsChanged();
    this.syncJsonEditor();
  }

  async saveSettings() {
    try {
      // Let sections normalise the outgoing payload (e.g. drop empty hotkeys).
      const payload = JSON.parse(JSON.stringify(this.currentSettings));
      for (const { definition } of this.sections) {
        definition.beforeSave?.(payload);
      }

      const result = await window.electronAPI.settings.save(payload);

      if (result.success) {
        this.currentSettings = payload;
        this.originalSettings = JSON.parse(JSON.stringify(payload));
        this.hasUnsavedChanges = false;
        this.populateUI();
        this.showSuccess('Settings saved successfully!');
        this.updateSaveButtonState();
      } else {
        this.showError('Failed to save settings: ' + result.error);
      }
    } catch (error) {
      this.showError('Failed to save settings: ' + error.message);
    }
  }

  handleWindowCloseRequest() {
    if (this.hasUnsavedChanges) {
      const confirmCancel = confirm('You have unsaved changes. Are you sure you want to close without saving?');
      if (!confirmCancel) {
        return; // Don't close the window
      }
    }

    // Force close the window
    if (window.electronAPI && window.electronAPI.forceClose) {
      window.electronAPI.forceClose();
    }
  }

  cancelSettings() {
    if (this.hasUnsavedChanges) {
      const confirmCancel = confirm('You have unsaved changes. Are you sure you want to cancel and lose these changes?');
      if (!confirmCancel) {
        return;
      }

      // Revert all changes back to original settings
      this.currentSettings = JSON.parse(JSON.stringify(this.originalSettings));
      this.hasUnsavedChanges = false;
      this.populateUI(); // Update the UI to show the reverted values
    }

    // Close the settings window
    if (window.electronAPI && window.electronAPI.forceClose) {
      window.electronAPI.forceClose();
    } else {
      // Fallback: try to close the window
      window.close();
    }
  }

  async saveJsonSettings() {
    try {
      const editor = document.getElementById('jsonEditor');
      const jsonText = editor.value;

      // Parse JSON to validate
      const parsedSettings = JSON.parse(jsonText);

      const result = await window.electronAPI.settings.save(parsedSettings);

      if (result.success) {
        this.currentSettings = parsedSettings;
        this.originalSettings = JSON.parse(JSON.stringify(parsedSettings));
        this.hasUnsavedChanges = false;
        this.populateUI();
        this.showSuccess('Settings saved successfully!');
        this.updateSaveButtonState();
      } else {
        this.showError('Failed to save settings: ' + result.error);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.showError('Invalid JSON syntax: ' + error.message);
      } else {
        this.showError('Failed to save settings: ' + error.message);
      }
    }
  }

  async resetAllSettings() {
    try {
      const newSettings = await window.electronAPI.settings.reset();
      this.currentSettings = newSettings;
      this.originalSettings = JSON.parse(JSON.stringify(newSettings));
      this.hasUnsavedChanges = false;
      this.populateUI();
      this.hideResetModal();
      this.showSuccess('All settings have been reset to defaults!');
      this.updateSaveButtonState();
    } catch (error) {
      this.showError('Failed to reset settings: ' + error.message);
    }
  }

  async exportSettings() {
    try {
      const jsonString = await window.electronAPI.settings.exportJson();

      // Create and trigger download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'genesis-client-settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showSuccess('Settings exported successfully!');
    } catch (error) {
      this.showError('Failed to export settings: ' + error.message);
    }
  }

  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const result = await window.electronAPI.settings.importJson(text);

        if (result.success) {
          this.currentSettings = result.settings;
          this.originalSettings = JSON.parse(JSON.stringify(result.settings));
          this.hasUnsavedChanges = false;
          this.populateUI();
          this.showSuccess('Settings imported successfully!');
          this.updateSaveButtonState();
        } else {
          this.showError('Failed to import settings: ' + result.error);
        }
      } catch (error) {
        this.showError('Failed to read file: ' + error.message);
      }
    };

    input.click();
  }

  setupSearch() {
    const searchBox = document.getElementById('searchBox');
    searchBox.addEventListener('input', (e) => {
      this.performSearch(e.target.value);
    });
  }

  performSearch(query) {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      // Show all settings
      document.querySelectorAll('.setting-item').forEach((item) => {
        item.style.display = 'block';
      });
      return;
    }

    document.querySelectorAll('.setting-item').forEach((item) => {
      const label = item.querySelector('.setting-label')?.textContent.toLowerCase() || '';
      const description = item.querySelector('.setting-description')?.textContent.toLowerCase() || '';

      if (label.includes(normalizedQuery) || description.includes(normalizedQuery)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  markAsChanged() {
    this.hasUnsavedChanges = true;
    this.updateSaveButtonState();
  }

  updateSaveButtonState() {
    const saveBtn = document.getElementById('saveBtn');
    const saveJsonBtn = document.getElementById('saveJsonBtn');

    if (this.hasUnsavedChanges) {
      saveBtn.textContent = 'Save*';
      if (saveJsonBtn) saveJsonBtn.textContent = 'Save JSON*';
      saveBtn.style.background = '#cc6633';
      if (saveJsonBtn) saveJsonBtn.style.background = '#cc6633';
    } else {
      saveBtn.textContent = 'Save';
      if (saveJsonBtn) saveJsonBtn.textContent = 'Save JSON';
      saveBtn.style.background = '#0e639c';
      if (saveJsonBtn) saveJsonBtn.style.background = '#0e639c';
    }
  }

  showResetModal() {
    document.getElementById('resetModal').classList.add('active');
  }

  hideResetModal() {
    document.getElementById('resetModal').classList.remove('active');
  }

  showError(message) {
    this.showMessage('errorMessage', message, 5000);
  }

  showSuccess(message) {
    this.showMessage('successMessage', message, 3000);
  }

  showMessage(elementId, message, timeout) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;
    element.style.display = 'block';

    clearTimeout(element.__messageTimer);
    element.__messageTimer = setTimeout(() => {
      element.style.display = 'none';
    }, timeout);
  }
}

// Initialize the settings renderer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.settingsRenderer = new SettingsRenderer();
});
