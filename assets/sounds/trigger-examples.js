// Example MUD trigger scripts using the sound API
// Place these examples in your MUD client's trigger system

// Example 1: Play an alert sound when someone whispers to you
// Trigger pattern: /(\w+) whispers to you:/
// JavaScript code:
mudAPI.playSound('whisper');

// Example 2: Play a combat sound when entering combat
// Trigger pattern: /You begin attacking/
// JavaScript code:
mudAPI.playSound('combat');

// Example 3: Play a death sound when you die
// Trigger pattern: /You have died\./
// JavaScript code:
mudAPI.playSound('death');

// Example 4: Play a level up sound 
// Trigger pattern: /You have gained a level!/
// JavaScript code:
mudAPI.playSound('level');

// Example 5: Play an alert sound with custom volume
// Trigger pattern: /IMPORTANT:/
// JavaScript code:
mudAPI.playSoundFile('alert.wav', 0.5); // 50% volume

// Example 6: Check if sound played successfully
// Trigger pattern: /Guild chat from (\w+):/
// JavaScript code:
if (await mudAPI.playSound('whisper')) {
    console.log('Guild chat sound played');
} else {
    console.log('Failed to play guild chat sound');
}

// Example 7: Play different sounds based on conditions
// Trigger pattern: /(\w+) tells you:/
// JavaScript code:
const sender = matches[1];
if (sender === 'ImportantPerson') {
    mudAPI.playSound('alert');
} else {
    mudAPI.playSound('whisper');
}

// Example 8: Test all available sounds (useful for debugging)
// You can run this in the browser console to test your sound setup
// JavaScript code:
mudAPI.testSounds();

// Example 9: Get current sound settings
// JavaScript code:
const soundSettings = mudAPI.getSoundSettings();
console.log('Sounds enabled:', soundSettings.enabled);
console.log('Master volume:', soundSettings.masterVolume);
console.log('Available sounds:', soundSettings.soundMappings.map(s => s.name));

// Example 10: Conditional sound based on health
// Trigger pattern: /Health: (\d+)\//
// JavaScript code:
const health = parseInt(matches[1]);
if (health < 20) {
    mudAPI.playSound('alert'); // Low health warning
}