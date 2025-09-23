# Sound Files for MUD Triggers

This directory contains sound files for MUD triggers. The GenesisClient sound system allows you to play sounds in response to MUD events using JavaScript triggers.

## Supported Formats
- `.wav` (recommended for low latency)
- `.mp3` 
- `.ogg`
- `.m4a`
- `.aac`
- `.flac`

## Default Sound Mappings

The application comes with these pre-configured sound mappings (you need to add the actual files):

- `alert.wav` - General alert sound
- `combat.wav` - Combat-related notifications  
- `whisper.wav` - Private message notifications
- `death.wav` - Character death sound
- `level.wav` - Level up notification

## Getting Sound Files

### Free Sound Sources:
1. **Freesound.org** - High-quality Creative Commons sounds
2. **Zapsplat.com** - Free sounds with registration
3. **Adobe Audition** - Comes with sound effects library
4. **YouTube Audio Library** - Free sounds for content creators

### Quick Setup:
1. Download short sound effects (1-3 seconds work best)
2. Convert to WAV format for best performance
3. Name them according to your configured mappings
4. Place them in this directory
5. Test using the Settings → Sound Settings → Test Sounds

### Sample Sound Ideas:
- **alert.wav**: Bell, chime, or notification sound
- **combat.wav**: Sword clash, battle horn, or action sound
- **whisper.wav**: Soft bell, whisper sound, or gentle chime
- **death.wav**: Dramatic sound, game over sound, or sad music
- **level.wav**: Success sound, fanfare, or celebration sound

## Using in MUD Triggers

Add JavaScript code to your MUD client triggers:

```javascript
// Basic usage
mudAPI.playSound('alert');

// With custom volume (0.0 to 1.0)
mudAPI.playSoundFile('combat.wav', 0.8);

// Check if sound played successfully
if (await mudAPI.playSound('whisper')) {
    console.log('Sound played successfully');
}
```

See `trigger-examples.js` for more detailed examples.

## Configuration

Configure sound mappings in Settings → Sound Settings:
- Enable/disable sounds globally
- Adjust master volume
- Add/remove sound mappings
- Test individual sounds