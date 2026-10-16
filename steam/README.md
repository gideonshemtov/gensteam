# Publishing to Steam (Linux)

This folder contains the SteamPipe upload setup for the Linux build. It uploads
the **unpacked** electron-builder output (not the AppImage).

## One-time setup

1. In [Steamworks](https://partner.steamgames.com/) create your **App** and a
   **Depot** for Linux, and note the **App ID** and **Depot ID**.
2. Set the depot's OS to **Linux / 64-bit**.
3. Install [SteamCMD](https://developer.valvesoftware.com/wiki/SteamCMD) and make
   sure `steamcmd` is on your `PATH`.
4. Create your `.env` file:

   ```bash
   cp .env.example .env
   ```

   then fill in at least:

   ```
   STEAM_APP_ID=1234560
   STEAM_DEPOT_ID=1234561
   ```

   `STEAM_USERNAME` is optional; without it steamcmd prompts for your password
   and Steam Guard code.

## Build and upload

```bash
# 1. Build the unpacked Linux app (outputs dist/linux-unpacked/)
pnpm run dist:linux:dir

# 2. Copy the build into steam/content/ and upload via SteamPipe
pnpm run steam:upload
```

### Uploading with Docker

If you don't have steamcmd installed locally, run it in Docker instead:

```bash
pnpm run dist:linux:dir
pnpm run steam:upload:docker
```

This prepares the content/VDFs on the host, then runs
[`cm2network/steamcmd`](https://hub.docker.com/r/cm2network/steamcmd) with the
repo mounted at the **same absolute path** (so the absolute paths in the VDF
resolve), prompts for your Steam password / Steam Guard code, and caches the
login in the `genesis-steam-home` named volume. Override the image with
`STEAMCMD_IMAGE=...`.

To only generate the depot content and VDFs (no upload):

```bash
pnpm run steam:prepare
```

### Windows

Build on a Windows machine (or SSH into one — enable **OpenSSH Server** first).
No Docker needed; use native `steamcmd.exe`.

```powershell
pnpm run dist:win:dir          # -> dist\win-unpacked\
```

`.env` for the Windows depot:

```
STEAM_PLATFORM=windows
STEAM_DEPOT_ID_WINDOWS=<windows depot id>
STEAMCMD=C:\steamcmd\steamcmd.exe
```

```powershell
pnpm run steam:upload
```

The launch executable is `GenesisClient.exe`; set the launch option's
**Operating System** to Windows and leave arguments empty.

Note: each platform needs its own **depot** in Steamworks (OS = Windows), and
`STEAM_DEPOT_ID` acts as a fallback for `STEAM_DEPOT_ID_<PLATFORM>`.

`steam:upload` will:

- read `.env`,
- copy `dist/linux-unpacked/` into `steam/content/`,
- render `steam/build/app_build_<APPID>.vdf` and
  `steam/build/depot_build_<DEPOTID>.vdf` from the templates,
- print the **launch executable** to use (e.g. `GenesisClient`),
- run `steamcmd +login ... +run_app_build ... +quit`.

## Configure launch options (Steamworks)

App → **Installation → General → Launch Options** → add:

| Field | Value |
|-------|-------|
| Executable | the name printed by `steam:upload` (the binary in the content root) |
| Arguments | `--no-sandbox` (see below) |
| Operating System | Linux |

## Linux / Electron notes

- **Chromium sandbox:** the `chrome-sandbox` SUID helper can fail when the game
  is launched by Steam. Add `--no-sandbox` to the launch arguments. This only
  disables the OS-level sandbox; the app still sandboxes its web content.
- **Steam Overlay / achievements** require the Steamworks SDK (e.g.
  [`steamworks.js`](https://github.com/ceifa/steamworks.js)). Not needed just to
  upload and run.
- **Steam Linux Runtime:** if the build misbehaves on older distributions, set
  the app to use the *Steam Linux Runtime (sniper)* compatibility tool.

## Recommended first run

Upload **without publishing** first: leave `STEAM_SETLIVE=` empty in `.env` so
the build is committed to Steamworks but not set live on any branch. Then, in
Steamworks → your app → **SteamPipe → Builds**, select the new build and
**Set Build Live** on a **beta** branch. Install it via Steam (Properties →
Betas) to test. When you're happy, set that build live on the **default**
branch (or upload again with `STEAM_SETLIVE=beta`).

## Generated / ignored files

`steam/content/`, `steam/build/`, `steam/output/`, and `.env` are git-ignored.
