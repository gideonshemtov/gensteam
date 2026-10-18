# Changelog

All notable changes to GenesisClient are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Configurable keyboard hotkeys: bind a key combination (e.g. `F1` or `Ctrl+1`) to a command that is sent while the game window is focused. Configure them in **Preferences → Hotkeys**; plain typing keys are rejected so normal input is never intercepted
- `pnpm run steam:release:linux` builds the Linux app natively (`dist/linux-unpacked/`) and uploads it to Steam with Docker in one command

### Changed

- Reorganized the application menu into File, Edit, View, Window and Help. Preferences and a Quit/Exit item move to File (Quit stays in the macOS app menu), a standard Edit menu (undo/redo/cut/copy/paste/select all) was added, and the former top-level Zoom menu is folded into View, which now only holds view-related items
- The Preferences window is built from one file pair per section (`settings/sections/<name>.js` controller + `<name>.html` markup), with shared styles in `settings.css` and a thin shell in `settings-renderer.js`, instead of one large HTML/renderer file. Section markup is read by the main process and inserted with `DOMParser` (never as raw HTML); behaviour is unchanged
- Steam depot selection now always uses `STEAM_DEPOT_ID`: each build machine (Linux, Windows, macOS) has its own `.env` with that platform's depot ID, so the `STEAM_DEPOT_ID_<PLATFORM>` overrides were removed

### Fixed

- The packaged app no longer bundles the `steam/` tooling directory, `test/`, `scripts/` or `.env`. The `files` glob was sweeping them into `app.asar`, which grew to gigabytes (each build packing the previous upload's content), broke the universal macOS build ("value of length is out of range") and shipped `.env` inside the app
- macOS builds are ad-hoc signed again (`mac.identity: "-"`). With electron-builder 26.x the app was silently left unsigned because the machine has no valid Developer ID, an accidental change from the previous builder version

## [1.0.21] - 2026-10-18

### Fixed

- The macOS app is now built as a regular foreground app (`LSUIElement`/`LSBackgroundOnly` set to false) and asks for its Dock icon at startup. Steam launches games without activating them, which left the client running as an accessory app with no menu bar of its own, so macOS kept showing Steam's menus.

## [1.0.20] - 2026-10-17

### Fixed

- The game window now takes over as soon as it launches instead of waiting for the page to finish painting, which could leave the Steam window (and its menu bar) in front for several seconds
- The macOS application menu is labelled "GenesisClient" instead of the internal package name "genesis-electron"

## [1.0.19] - 2026-10-17

### Fixed

- The game reliably takes over the macOS menu bar when launched from Steam: alongside the focus retries it now asks LaunchServices to activate the running app and re-asserts activation once the page has loaded
- Only one instance of the client can run; launching it again focuses the existing window

### Added

- Startup diagnostics are appended to `startup.log` in the app's user data directory (launch parent, menu labels, and focus state after each activation attempt)

## [1.0.18] - 2026-10-17

### Added

- macOS support for the Steam upload tooling (`pnpm run steam:release:mac` builds a universal app and uploads it via SteamPipe); `steam:upload` now accepts `--platform=<linux|windows|mac>` and prints the `.app` bundle to use as the launch option (pointing Steam at the inner binary makes it run under Rosetta on Apple Silicon)
- `pnpm run steam:login` logs in to Steam (seeding/verifying the cached login) without building or uploading

### Fixed

- Steam uploads no longer re-prompt for the Steam password / Steam Guard on every run: steamcmd is now run with a private `HOME` (`~/.genesis-steamcmd`) so its cached login is not clobbered by the Steam client
- Depot content now preserves symlinks verbatim; macOS `.app` framework symlinks (e.g. `Electron Framework.framework/Versions/Current`) were being uploaded as absolute paths pointing at the build machine, which made the installed app fail to launch
- Closing the game window now quits the app on macOS too, so Steam stops reporting the game as running
- The game window is brought to the front when launched from Steam instead of opening behind the Steam window; activation is retried briefly so Steam cannot re-take focus after launch
- On macOS the app is forced to a regular foreground app (Dock icon and its own menu bar) so launching from Steam shows the client's menus rather than Steam's

## [1.0.17] - 2026-10-15

### Added

- Unit test suite using Node's built-in test runner (`pnpm test`)
- Custom buttons can be added, edited, and removed from the Preferences UI
- Steam upload tooling (Linux + Windows): `pnpm run steam:upload` publishes the unpacked build via SteamPipe using App/Depot IDs from `.env`, with a Docker runner for Linux
- Text size (zoom) controls: a Zoom menu, Ctrl+= / Ctrl+- / Ctrl+0 shortcuts, and Ctrl+mouse wheel; a boxed percentage badge appears in the top-right and the level is remembered across restarts

### Changed

- Game URL is now hardcoded and no longer configurable through settings
- Preferences now opens as a modal dialog that blocks the game window until it is closed
- The game window is dimmed while preferences are open to show it is inactive
- Consolidated command sending and added a reusable on-screen toast (used for the zoom indicator)

### Removed

- "Start URL" setting (`game.startUrl`) and the Game Settings section in the preferences window

### Fixed

- Timer changes no longer trigger a settings update loop that froze the button panel and timers
- Volume changes now follow the same save flow as other settings (removed the silent auto-save)

### Security

- Navigation is validated by comparing parsed origins exactly, blocking look-alike domains
- External links are restricted to `http`, `https`, and `mailto` before reaching OS protocol handlers
- Timer settings IPC now verifies the sender frame and only persists validated timer data
- Preferences UI renders settings values as text (no HTML injection) and ships a Content-Security-Policy

## [1.0.16] - 2026-08-02

### Fixed

- Sound playback now uses Chromium Audio API instead of shell commands (PowerShell, afplay, etc.)

## [1.0.15] - 2025-11-08

### Added

- Find-in-page overlay (View → Find, Ctrl+F / Cmd+F)
- Window opens maximized by default

### Changed

- Refactored main process into separate modules

### Fixed

- Sound volume handling (master volume applied correctly; per-mapping volume removed)
- Reduced default whisper sound file size

## [1.0.14] - 2025-10-16

### Fixed

- Sound playback on Windows

## [1.0.13] - 2025-10-14

### Added

- Sound system with configurable mappings for MUD triggers
- Default sound files (alert, combat, whisper, death, level)
- WebSocket command bridge — buttons and timers send commands through the game client
- Help → About dialog

### Fixed

- Button panel and timer manager re-initialize correctly after page reload
- Timer panel empty state when no timers exist

### Changed

- Sound mapping editing disabled in the settings UI (edit via JSON settings editor)

## [1.0.12] - 2025-09-12

### Fixed

- Preferences window closes when the main window is closed
- Window close behavior after page reload
- Delete timer no longer requires a confirmation dialog

### Changed

- Removed hide-menu-bar hint from settings description

## [1.0.11] - 2025-09-11

### Fixed

- Timer and settings reload behavior

## [1.0.10] - 2025-09-10

### Added

- Command timers with recurring automatic command execution

### Changed

- Publisher/author updated to Genesis Mud

## [1.0.9] - 2025-09-10

### Added

- Option to hide the menu bar (Alt to show temporarily)
- Application icons for Windows, macOS, and Linux

## [1.0.8] - 2025-09-10

### Fixed

- Distribution build fixes (packaging and dependency inclusion)

## [1.0.7] - 2025-09-09

### Changed

- Updated Electron and electron-builder dependencies
- Button panel refactor and UI adjustments
- Removed unused settings

## [1.0.0] - 2025-08-14

### Added

- Initial Electron desktop client for Genesis MUD
- Customizable quick-action button panel
- Settings window with UI, buttons, and window configuration
- Sandboxed web content with context isolation
- External links open in the default browser
- Navigation restricted to the configured Genesis MUD origin
- Cross-platform builds (Windows NSIS, macOS DMG, Linux AppImage)
