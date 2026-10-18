// settings/sections/sounds.js - Sound settings section.
(function () {
  function updateVolumeDisplay(root, value) {
    const volumeValue = root.querySelector('#volumeValue');
    if (volumeValue) {
      volumeValue.textContent = `${Math.round(value * 100)}%`;
    }
  }

  async function playSound(soundName, ctx) {
    try {
      const sounds = ctx.settings.sounds?.soundMappings || [];
      const sound = sounds.find((candidate) => candidate.name === soundName);
      if (!sound) {
        ctx.showError(`Sound mapping not found: ${soundName}`);
        return;
      }

      if (!ctx.api?.getSoundUrl) {
        ctx.showError('Sound testing not available');
        return;
      }

      const url = ctx.api.getSoundUrl(sound.filename);
      if (!url) {
        ctx.showError(`Failed to play sound: ${soundName}. Check if the file exists in assets/sounds/`);
        return;
      }

      const masterVolume = ctx.settings.sounds?.masterVolume ?? 1.0;
      const audio = new Audio(url);
      audio.volume = Math.min(1, Math.max(0, masterVolume));
      await audio.play();
      ctx.showSuccess(`Played sound: ${soundName}`);
    } catch (error) {
      ctx.showError('Error testing sound: ' + error.message);
    }
  }

  function populateSoundList(root, ctx) {
    const soundList = root.querySelector('#soundList');
    if (!soundList) return;

    const sounds = ctx.settings.sounds?.soundMappings || [];
    soundList.textContent = '';

    sounds.forEach((sound) => {
      const soundItem = document.createElement('div');
      soundItem.className = 'button-item'; // Reuse button item styling

      const preview = document.createElement('div');
      preview.className = 'button-preview';
      preview.style.background = '#4a90e2';
      preview.style.border = '1px solid #4a90e2';
      preview.style.fontSize = '12px';
      preview.textContent = '🔊';

      const info = document.createElement('div');
      info.className = 'button-info';

      const title = document.createElement('div');
      title.className = 'button-title';
      title.textContent = `${sound.name ?? ''} (${sound.filename ?? ''})`;

      const description = document.createElement('div');
      description.className = 'button-command';
      description.textContent = sound.description || 'No description';

      info.append(title, description);

      const testButton = document.createElement('button');
      testButton.className = 'btn';
      testButton.textContent = 'Test';
      testButton.style.marginLeft = '10px';
      testButton.style.padding = '4px 8px';
      testButton.style.fontSize = '11px';
      testButton.addEventListener('click', () => playSound(sound.name, ctx));

      soundItem.append(preview, info, testButton);
      soundList.appendChild(soundItem);
    });
  }

  window.GenesisSettings.register({
    id: 'sounds',
    title: 'Sound Settings',
    icon: '🔊',
    template: `
      <div class="setting-group">
        <div class="setting-group-title">Sound Settings</div>

        <div class="setting-item">
          <label class="setting-label">Enable Sounds</label>
          <div class="setting-description">Enable or disable all sound playback for MUD triggers</div>
          <input type="checkbox" class="setting-input setting-checkbox" data-path="sounds.enabled">
        </div>

        <div class="setting-item">
          <label class="setting-label">Master Volume <span id="volumeValue" style="color: #4a90e2; font-weight: normal;">100%</span></label>
          <div class="setting-description">Master volume control for all sounds</div>
          <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
            <span style="color: #888; font-size: 12px;">🔇</span>
            <input type="range" id="volumeSlider" class="setting-input volume-slider" data-path="sounds.masterVolume" min="0" max="1" step="0.01" style="flex: 1;">
            <span style="color: #888; font-size: 12px;">🔊</span>
          </div>
        </div>

        <div class="setting-item">
          <label class="setting-label">Sound Mappings</label>
          <div class="setting-description">View configured sound names to file mappings. Place sound files in the assets/sounds/ directory. Use these names in your MUD triggers with mudAPI.playSound("soundName"). To modify sound mappings, use the JSON editor.</div>
          <div class="button-list" id="soundList"></div>
        </div>

        <div class="setting-item">
          <label class="setting-label">Usage in MUD Triggers</label>
          <div class="setting-description">
            <p style="margin-bottom: 10px;">Use the following JavaScript in your MUD client triggers to play sounds:</p>
            <div style="background: #1e1e1e; padding: 10px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 12px; color: #d4d4d4; border: 1px solid #3e3e42;">
              <div style="color: #608b4e;">// Play a configured sound by name</div>
              <div>mudAPI.playSound("alert");</div>
              <div style="margin-top: 5px; color: #608b4e;">// Play a sound file directly with volume</div>
              <div>mudAPI.playSoundFile("combat.wav", 0.8);</div>
              <div style="margin-top: 5px; color: #608b4e;">// Test if sound is available</div>
              <div><span style="color: #c586c0;">if</span> (<span style="color: #569cd6;">await</span> mudAPI.playSound("whisper")) {</div>
              <div>&nbsp;&nbsp;<span style="color: #608b4e;">// Sound played successfully</span></div>
              <div>}</div>
            </div>
            <p style="margin-top: 10px; font-size: 11px; color: #888;">Supported formats: .wav, .mp3, .ogg, .m4a, .aac, .flac</p>
          </div>
        </div>
      </div>
    `,
    setup(root, ctx) {
      const slider = root.querySelector('#volumeSlider');
      slider.addEventListener('input', () => {
        updateVolumeDisplay(root, slider.value);
      });
    },
    populate(root, ctx) {
      populateSoundList(root, ctx);
      const slider = root.querySelector('#volumeSlider');
      if (slider) {
        updateVolumeDisplay(root, slider.value);
      }
    },
  });
})();
