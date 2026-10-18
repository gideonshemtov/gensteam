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
    partial: 'sounds',
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
