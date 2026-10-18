# Publishing to Steam

This folder contains the SteamPipe upload setup for the Linux, Windows, and
macOS builds. It uploads the **unpacked** electron-builder output (not the
AppImage/DMG/zip).

## One-time setup

1. In [Steamworks](https://partner.steamgames.com/) create your **App** and one
   **Depot per platform**, and note the **App ID** and **Depot IDs**.
2. Set each depot's OS (**Linux / 64-bit**, **Windows**, or **macOS**).
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
pnpm run steam:release:linux   # == dist:linux:dir + steam:upload:docker
```

Or run the two steps yourself:

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

`.env` on the Windows machine:

```
STEAM_PLATFORM=windows
STEAM_DEPOT_ID=<windows depot id>
STEAMCMD=C:\steamcmd\steamcmd.exe
```

```powershell
pnpm run steam:upload
```

The launch executable is `GenesisClient.exe`; set the launch option's
**Operating System** to Windows and leave arguments empty.

### macOS

Build on a Mac (universal binaries need both architectures present, so this must
run on macOS). No Docker needed; use native `steamcmd`.

```bash
pnpm run steam:release:mac     # == dist:mac:dir (universal) + steam:upload:mac
```

Or run the two steps yourself:

```bash
pnpm run dist:mac:dir          # -> dist/mac-universal/GenesisClient.app
pnpm run steam:upload:mac      # == node steam/upload.js --platform=mac
```

`.env` on the Mac:

```
STEAM_PLATFORM=mac
STEAM_DEPOT_ID=<macOS depot id>
```

The launch option **Executable** is `GenesisClient.app` (the bundle itself). In
Steamworks set the launch option's **Operating System** to **macOS** and leave
arguments empty.

> **Important:** point the launch option at the `.app` **bundle**, not the inner
> binary (`GenesisClient.app/Contents/MacOS/GenesisClient`). Targeting the inner
> binary makes Steam launch it in its **x86_64 / Rosetta** context on Apple
> Silicon, which crashes Electron apps (the window flashes and closes). Launching
> the bundle lets macOS pick the native arm64 slice.

Note: each platform needs its own **depot** in Steamworks, but not its own key
in `.env`. Each build machine has its own `.env`, so `STEAM_DEPOT_ID` holds that
machine's platform depot (Linux on the Linux box, Windows on the Windows box,
and so on). There are no `STEAM_DEPOT_ID_<PLATFORM>` overrides.

`steam:upload` will:

- read `.env`,
- copy the platform build (e.g. `dist/linux-unpacked/`, `dist/mac-universal/`)
  into `steam/content/`,
- render `steam/build/app_build_<APPID>.vdf` and
  `steam/build/depot_build_<DEPOTID>.vdf` from the templates,
- print the **launch option** to use (e.g. `GenesisClient`,
  `GenesisClient.exe`, or `GenesisClient.app`),
- run `steamcmd +login ... +run_app_build ... +quit`.

## Configure launch options (Steamworks)

App → **Installation → General → Launch Options** → add one per platform:

| Field | Value |
|-------|-------|
| Executable | the name printed by `steam:upload` (the binary/bundle in the content root) |
| Arguments | `--no-sandbox` on Linux (see below); empty on Windows/macOS |
| Operating System | Linux, Windows, or macOS |

## Linux / Electron notes

- **Chromium sandbox:** the `chrome-sandbox` SUID helper can fail when the game
  is launched by Steam. Add `--no-sandbox` to the launch arguments. This only
  disables the OS-level sandbox; the app still sandboxes its web content.
- **Steam Overlay / achievements** require the Steamworks SDK (e.g.
  [`steamworks.js`](https://github.com/ceifa/steamworks.js)). Not needed just to
  upload and run.
- **Steam Linux Runtime:** if the build misbehaves on older distributions, set
  the app to use the *Steam Linux Runtime (sniper)* compatibility tool.

## macOS notes

- **Launch option:** set the Executable to the **`GenesisClient.app` bundle**,
  not the inner binary inside it. Pointing at
  `GenesisClient.app/Contents/MacOS/GenesisClient` makes Steam run the app under
  **Rosetta (x86_64)** on Apple Silicon, which crashes Electron renderers.
- **Content root:** the depot must contain the `GenesisClient.app` bundle, so the
  content root is the folder that holds it (`dist/mac-universal/`), **not** the
  `.app` itself.
- **Universal builds:** `dist:mac:dir` builds `x64 + arm64`. Universal builds
  cannot be produced by cross-compiling, so run this on macOS.
- **Code signing / notarization:** not required just to upload and run from
  Steam. If you sign for direct distribution, keep signing enabled for the Steam
  build too so Gatekeeper is happy on download.

## Recommended first run

Upload **without publishing** first: leave `STEAM_SETLIVE=` empty in `.env` so
the build is committed to Steamworks but not set live on any branch. Then, in
Steamworks → your app → **SteamPipe → Builds**, select the new build and
**Set Build Live** on a **beta** branch. Install it via Steam (Properties →
Betas) to test. When you're happy, set that build live on the **default**
branch (or upload again with `STEAM_SETLIVE=beta`).

## Cached login (avoid re-entering the password)

`steam:upload` runs steamcmd with its own private `HOME` (`~/.genesis-steamcmd`
by default, override with `STEAMCMD_HOME` in `.env`) so its cached login lives
separately from the Steam client's config. The **first** upload prompts for your
password and Steam Guard code; every upload after that reuses the cached login
and runs without prompting.

This matters on macOS in particular: when steamcmd shares the Steam client's
directory the client overwrites the cache, so the password and Steam Guard are
requested on every run.

To seed/verify the cache without building or uploading anything:

```bash
pnpm run steam:login   # first run prompts; later runs are silent
```

## Generated / ignored files

`steam/content/`, `steam/build/`, `steam/output/`, and `.env` are git-ignored.
