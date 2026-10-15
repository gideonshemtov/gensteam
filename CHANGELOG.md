# Changelog

All notable changes to GenesisClient are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.17] - 2026-10-15

### Added

- Unit test suite using Node's built-in test runner (`pnpm test`)

### Changed

- Game URL is now hardcoded and no longer configurable through settings

### Removed

- "Start URL" setting (`game.startUrl`) and the Game Settings section in the preferences window

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
