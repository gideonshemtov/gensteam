# Genesis MUD — Official Desktop Client

The official desktop client for [Genesis MUD](https://www.genesismud.org), built with Electron. GenesisClient provides a dedicated desktop experience for playing Genesis MUD and is intended for distribution on Steam.

## Features

- **Dedicated Desktop Experience**: Run Genesis MUD as a standalone desktop application
- **Customizable Button Panel**: Quick access to frequently used commands
- **Alias-aware Commands**: Buttons, hotkeys, and timers use the web client's own command path, so player-defined JavaScript aliases run as if the command was typed
- **Keyboard Hotkeys**: Bind key combinations (e.g. `F1` or `Ctrl+1`) to commands that are sent while the game window is focused
- **Command Timers**: Set up recurring commands that execute automatically at specified intervals
- **Find in Page**: Search game text with Ctrl+F (Cmd+F on macOS)
- **Adjustable Text Size**: Zoom the game text with Ctrl +/−/0 or Ctrl + mouse wheel; a boxed percentage badge appears in the top-right
- **Sound Triggers**: Play configured sounds from MUD client triggers via `mudAPI`
- **Auto-hiding Menu Bar**: Clean, distraction-free interface
- **Settings Management**: Customize the interface, buttons, sounds, and window defaults
- **Security-focused**: Sandboxed web environment with restricted permissions
- **External Link Handling**: Links open in your default browser instead of within the app
- **Cross-platform**: Available for Windows, macOS, and Linux

## Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or higher)
- [pnpm](https://pnpm.io/) package manager

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   pnpm install
   ```

## Usage

### Development Mode

To run the application in development mode:

```bash
pnpm start
```

### Building for Distribution

#### Windows
```bash
pnpm run dist:win
```

#### macOS
```bash
pnpm run dist:mac          # DMG
pnpm run dist:mac:dir      # unpacked universal build (dist/mac-universal/)
```

#### Linux
```bash
pnpm run dist:linux
```

#### All Platforms (Directory Build)
```bash
pnpm run pack
```

### Publishing to Steam (Linux, Windows, macOS)

Builds the unpacked app and uploads it to Steam via SteamPipe. Put your App ID
and depot IDs in a `.env` file (see `.env.example`) and follow
[`steam/README.md`](steam/README.md):

```bash
# Linux (build natively, upload with Docker)
pnpm run steam:release:linux   # == dist:linux:dir + steam:upload:docker

# macOS (run on a Mac; builds a universal app)
pnpm run steam:release:mac   # == dist:mac:dir + steam:upload:mac
```

Windows uses the same flow with `pnpm run dist:win:dir` and a `STEAM_PLATFORM=windows`
`.env` setting; see [`steam/README.md`](steam/README.md).

## Testing

The project uses Node's built-in test runner, so no extra dependencies are required:

```bash
pnpm test
```

Tests live in `test/` and cover settings persistence and migration, navigation/origin
protection, external-link scheme filtering, timer IPC validation, and timer behaviour.
Main-process modules are exercised against a lightweight `electron` stub
(`test/helpers/electron-stub.js`), so no display or Electron runtime is needed.

## Project Structure

```
├── main.js                   # Main Electron process
├── index.js                  # Entry point
├── find-bar.html             # Find-in-page overlay UI
├── timer-preload.js          # Timer IPC preload script
├── js/
│   ├── ButtonPanel.js        # Button panel management
│   ├── HotkeyManager.js      # Configurable command hotkeys
│   ├── hotkeyKeys.js         # Hotkey parsing/matching (shared with preferences)
│   ├── TimerManager.js       # Command timer functionality
│   ├── CommandSender.js      # Shared command-sending (client bridge / mudAPI / input fallback)
│   ├── WebClientHook.js      # Injects the alias-aware command bridge into the game bundle
│   ├── game.js               # Shared game client URL and origin
│   ├── PageToast.js          # Reusable on-screen toast (zoom indicator)
│   ├── ZoomController.js     # Shared zoom logic
│   ├── MudConnector.js       # WebSocket bridge and mudAPI
│   ├── SoundManager.js       # In-page sound playback
│   ├── SoundProtocol.js      # Custom protocol for bundled sound files
│   ├── FindBarManager.js     # Find-in-page overlay
│   ├── MenuBuilder.js        # Application menu
│   └── WindowManager.js      # Main window lifecycle
├── settings/
│   ├── SettingsManager.js    # Settings persistence and validation
│   ├── SettingsWindow.js     # Settings window management
│   ├── settings-renderer.js  # Preferences shell (nav, save/reset, JSON, search)
│   ├── settings-preload.js   # Settings preload script
│   ├── settings.html         # Preferences shell markup
│   ├── settings.css          # Preferences styles
│   └── sections/             # One .js controller + .html markup partial per preferences section
├── assets/                   # Application icons and sound files
├── test/                     # Unit tests (Node built-in test runner)
├── steam/                    # SteamPipe upload scripts and docs
├── package.json              # Project configuration and build settings
└── README.md                 # This file
```

## Using Command Timers

The application includes a timer system that allows you to execute commands automatically at specified intervals.

### Accessing Timer Controls

1. Click the **⏰ Timer** button in the left panel to open the timer controls
2. The timer panel will appear next to the button panel

### Creating a New Timer

1. **Name**: Give your timer a descriptive name (e.g., "Health Check")
2. **Interval**: Set how often the command should run (1–3600 seconds)
3. **Command**: Enter the command to execute (e.g., `health`, `look`, `inventory`)
4. Click **Create Timer** to save

### Managing Timers

- **Start Timer**: Click the "Start" button to begin running the timer
- **Stop Timer**: Click the "Stop" button to pause the timer
- **Delete Timer**: Click "Delete" to permanently remove a timer

### Example Timer Setups

- **Health Monitor**: Command `health` every 30 seconds
- **Auto Look**: Command `look` every 60 seconds
- **Status Check**: Command `stats` every 45 seconds
- **Auto Save**: Command `save` every 300 seconds (5 minutes)

### Timer Features

- Timers persist between application sessions
- Multiple timers can run simultaneously
- Commands are sent without interrupting your current typing
- Visual indicators show which timers are currently active

## Using the Button Panel

The left sidebar contains customizable quick-action buttons for common commands.

### Default Buttons

- **💎 Look Around** — Executes `look` command
- **🔥 Check Inventory** — Executes `inventory` command
- **🪄 Check Stats** — Executes `stats` command
- **❤️ Check Health** — Executes `health` command
- **⚡ Who's Online** — Executes `who` command

### Customization

1. Go to **View → Preferences** → **Custom Buttons**
2. Edit each button's icon, title, command, and color, or click **Remove** to delete it
3. Click **+ Add Button** to add a new one
4. Click **Save** to apply your changes

## Keyboard Hotkeys

Hotkeys send commands to the MUD when you press a key combination while the game window is focused.

### Creating a Hotkey

1. Go to **View → Preferences** → **Hotkeys**
2. Click **+ Add Hotkey**
3. Click the key field and press the combination you want (e.g. `F1` or `Ctrl+1`)
4. Enter the command to send (e.g. `look`)
5. Click **Save**

### Hotkey Notes

- A hotkey must include Ctrl/Cmd/Alt, or be a function/navigation key (F1–F24, arrows, Home/End, Page Up/Page Down, Insert/Delete, Escape). Plain letters and numbers are rejected so normal typing is never intercepted.
- Hotkeys only fire while the game window is focused; they are ignored when another window (e.g. Preferences) is active.
- The key is consumed, so it does not also reach the game or a menu shortcut.
- Repeat while held is ignored, so holding a hotkey does not flood the MUD with commands.

## Sound Triggers

The client can play sounds in response to MUD client triggers. Configure sounds in **Preferences → Sound Settings**, then reference them from trigger scripts:

```javascript
// Play a configured sound by name
mudAPI.playSound("alert");

// Play a sound file directly with volume
mudAPI.playSoundFile("combat.wav", 0.8);
```

Place sound files in `assets/sounds/`. Sound mappings can be edited in the JSON settings editor.

## Command Sending and MUD API

Buttons, hotkeys, and timers send commands through the official web client's own command path. The app injects a small `window.genesisClient` bridge into the game bundle while it downloads, so the player's JavaScript aliases run and the client handles echo and output normally. If the bundle cannot be patched, the app falls back to the raw WebSocket and input-field paths.

The injected bridge exposes:

| Method | Description |
|--------|-------------|
| `genesisClient.send(command)` | Alias-aware send through the client's normal command path |
| `genesisClient.sendRaw(command)` | Raw send that bypasses aliases |
| `genesisClient.sendTyped(command)` | Alias-aware send that also records the command in input history |
| `genesisClient.isConnected()` | Whether the MUD WebSocket is connected |

The client also exposes `window.mudAPI` for trigger scripts:

| Method | Description |
|--------|-------------|
| `mudAPI.send(message)` | Raw WebSocket send (adds newline and shows in output; bypasses aliases) |
| `mudAPI.directSend(message)` | Raw WebSocket send without output display |
| `mudAPI.playSound(name)` | Play a configured sound by name |
| `mudAPI.playSoundFile(filename, volume)` | Play a sound file directly |
| `mudAPI.status()` | Show WebSocket, bridge, and sound status |

## Configuration

The application can be customized through the preferences window (**View → Preferences**), which opens as a modal dialog over the game window:

- **UI Settings**: Toggle button panel, adjust panel width, hide menu bar
- **Button Configuration**: Customize command buttons
- **Hotkey Configuration**: Bind key combinations to commands
- **Sound Settings**: Enable sounds, master volume, and sound mappings
- **Window Settings**: Default window size
- **JSON Editor**: Direct editing of the full settings file

## Security Features

- **Sandboxed Environment**: The web content runs in a sandboxed environment
- **No Node Integration**: Prevents the web content from accessing Node.js APIs
- **Context Isolation**: Ensures the main world and isolated world contexts are separate
- **Permission Denial**: All permission requests are automatically denied
- **Navigation Protection**: Prevents navigation away from the (hardcoded) Genesis MUD origin
- **External Link Filtering**: Only `http`, `https`, and `mailto` links are handed to the operating system
- **IPC Validation**: Timer updates are validated and only accepted from the game client frame
- **No HTML Injection in Settings**: Preferences renders settings values as text and enforces a Content-Security-Policy

## Build Output

The built applications will be available in the `dist/` directory:

- **Windows**: NSIS installer (`GenesisClient`)
- **macOS**: DMG file
- **Linux**: AppImage

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

MIT License
