#!/usr/bin/env bash
# steam/docker-upload.sh
# Prepare the Linux depot on the host, then upload it to Steam using steamcmd
# running in Docker. Credentials are prompted for interactively.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env - copy .env.example to .env and set STEAM_APP_ID / STEAM_DEPOT_ID." >&2
  exit 1
fi

# 1. Copy the unpacked build into steam/content and render the VDFs (host Node).
node steam/upload.js --prepare

# shellcheck disable=SC1091
set -a
source .env
set +a

: "${STEAM_APP_ID:?STEAM_APP_ID is not set in .env}"
APP_BUILD="$REPO_ROOT/steam/build/app_build_${STEAM_APP_ID}.vdf"
IMAGE="${STEAMCMD_IMAGE:-cm2network/steamcmd:latest}"
LOGIN="${STEAM_USERNAME:-anonymous}"

# The repo is mounted at the same absolute path so the VDF's absolute
# contentroot/buildoutput resolve inside the container. A named volume keeps
# the Steam login (and Steam Guard trust) between runs.
echo
echo "Uploading with ${IMAGE} (login: ${LOGIN})"
echo "Steam will prompt for your password / Steam Guard code."
echo

exec docker run --rm -it \
  -v "${REPO_ROOT}:${REPO_ROOT}" \
  -v genesis-steam-home:/home/steam/Steam \
  -w "${REPO_ROOT}/steam/build" \
  "${IMAGE}" \
  bash -lc "/home/steam/steamcmd/steamcmd.sh +login ${LOGIN} +run_app_build '${APP_BUILD}' +quit"
