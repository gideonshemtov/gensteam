# Genesis MUD Desktop Wrapper

A desktop application wrapper for [Genesis MUD](https://www.genesismud.org) built with Electron. This app provides a dedicated desktop experience for playing Genesis MUD without needing to keep a web browser tab open.

## Features

- **Dedicated Desktop Experience**: Run Genesis MUD as a standalone desktop application
- **Auto-hiding Menu Bar**: Clean, distraction-free interface
- **Security-focused**: Sandboxed web environment with restricted permissions
- **External Link Handling**: Links open in your default browser instead of within the app
- **Cross-platform**: Available for Windows, macOS, and Linux

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher)
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
pnpm run dist:mac
```

#### Linux
```bash
pnpm run dist:linux
```

#### All Platforms (Directory Build)
```bash
pnpm run pack
```

## Project Structure

```
├── main.js          # Main Electron process
├── index.js         # Entry point (forwards to main.js)
├── package.json     # Project configuration and build settings
└── README.md        # This file
```

## Configuration

The application is configured to:
- Start with a window size of 1280x800 pixels
- Use a black background
- Load the Genesis MUD web client from `https://www.genesismud.org/play`
- Prevent navigation away from the Genesis domain
- Deny permission requests (camera, microphone, etc.)
- Open external links in the system's default browser

## Security Features

- **Sandboxed Environment**: The web content runs in a sandboxed environment
- **No Node Integration**: Prevents the web content from accessing Node.js APIs
- **Context Isolation**: Ensures the main world and isolated world contexts are separate
- **Permission Denial**: All permission requests are automatically denied
- **Navigation Protection**: Prevents navigation away from the Genesis MUD domain

## Build Output

The built applications will be available in the `dist/` directory:
- **Windows**: NSIS installer
- **macOS**: DMG file
- **Linux**: AppImage

## License

MIT License

## Author

You

---

*This is an unofficial desktop wrapper for Genesis MUD. Genesis MUD is a trademark of its respective owners.*
