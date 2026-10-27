// Keep in sync with build.appId in package.json (enforced by a test).
//
// The packaged app's package.json is pruned by electron-builder and no longer
// contains the "build" config, so main.js cannot read build.appId at runtime.
// The macOS LaunchServices activation fallback needs the bundle id, so it lives
// here as a runtime constant.
module.exports = 'org.genesis.client';
