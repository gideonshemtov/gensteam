// timer-preload.js - Preload script for timer IPC communication
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe IPC methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  saveTimerSettings: (settings) => ipcRenderer.invoke('save-timer-settings', settings),
  
  // Sound-related APIs
  playSound: (filename, volume = 1.0) => ipcRenderer.invoke('play-sound', filename, volume),
  getAvailableSounds: () => ipcRenderer.invoke('get-available-sounds'),
  
  // Find-related APIs
  onShowFind: (callback) => ipcRenderer.on('show-find', callback),
  findInPage: (text, options) => ipcRenderer.send('find-in-page', text, options),
  stopFindInPage: (action) => ipcRenderer.send('stop-find-in-page', action),
  onFoundInPage: (callback) => ipcRenderer.on('found-in-page', callback),
});

// Inject find UI after DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  let findUI = null;
  let currentSearchIndex = 0;
  let searchResults = [];
  
  function createFindUI() {
    if (findUI) return;
    
    findUI = document.createElement('div');
    findUI.id = 'electron-find-ui';
    findUI.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 999999;
      background: #2d2d30;
      border: 1px solid #3e3e42;
      border-radius: 4px;
      padding: 8px 12px;
      display: none;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 13px;
    `;
    
    findUI.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <input type="text" id="find-input" placeholder="Find in page..." style="
          background: #3c3c3c;
          border: 1px solid #5a5a5a;
          color: #cccccc;
          padding: 4px 8px;
          border-radius: 3px;
          outline: none;
          width: 200px;
        ">
        <span id="find-count" style="color: #888; font-size: 11px; min-width: 40px;"></span>
        <button id="find-prev" style="
          background: #0e639c;
          border: 1px solid #3e3e42;
          color: white;
          padding: 4px 8px;
          border-radius: 3px;
          cursor: pointer;
        ">↑</button>
        <button id="find-next" style="
          background: #0e639c;
          border: 1px solid #3e3e42;
          color: white;
          padding: 4px 8px;
          border-radius: 3px;
          cursor: pointer;
        ">↓</button>
        <button id="find-close" style="
          background: transparent;
          border: none;
          color: #cccccc;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 16px;
        ">×</button>
      </div>
    `;
    
    document.body.appendChild(findUI);
    
    const input = document.getElementById('find-input');
    const count = document.getElementById('find-count');
    const prev = document.getElementById('find-prev');
    const next = document.getElementById('find-next');
    const close = document.getElementById('find-close');
    
    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const text = input.value;
      if (text) {
        debounceTimer = setTimeout(() => {
          window.electronAPI.findInPage(text, { findNext: false });
        }, 100);
      } else {
        count.textContent = '';
        window.electronAPI.stopFindInPage('clearSelection');
      }
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          window.electronAPI.findInPage(input.value, { forward: false, findNext: true });
        } else {
          window.electronAPI.findInPage(input.value, { forward: true, findNext: true });
        }
      } else if (e.key === 'Escape') {
        hideFindUI();
      }
    });
    
    next.addEventListener('click', () => {
      if (input.value) {
        window.electronAPI.findInPage(input.value, { forward: true, findNext: true });
      }
    });
    
    prev.addEventListener('click', () => {
      if (input.value) {
        window.electronAPI.findInPage(input.value, { forward: false, findNext: true });
      }
    });
    
    close.addEventListener('click', () => {
      hideFindUI();
    });
  }
  
  function showFindUI() {
    createFindUI();
    findUI.style.display = 'block';
    document.getElementById('find-input').focus();
  }
  
  function hideFindUI() {
    if (findUI) {
      findUI.style.display = 'none';
      window.electronAPI.stopFindInPage('clearSelection');
    }
  }
  
  // Listen for show-find event from main process
  ipcRenderer.on('show-find', () => {
    showFindUI();
  });
  
  // Listen for found-in-page results
  ipcRenderer.on('found-in-page', (event, result) => {
    const count = document.getElementById('find-count');
    if (count && result.matches > 0) {
      count.textContent = `${result.activeMatchOrdinal}/${result.matches}`;
    } else if (count) {
      count.textContent = result.matches === 0 ? 'No matches' : '';
    }
  });
});
