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

Publish to a **beta branch** first (`STEAM_SETLIVE=beta` in `.env`), install from
Steam (Properties → Betas), verify, then re-run with `STEAM_SETLIVE=` empty to
publish to the default branch.

## Generated / ignored files

`steam/content/`, `steam/build/`, `steam/output/`, and `.env` are git-ignored.
