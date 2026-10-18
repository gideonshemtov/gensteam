// settings/sections/registry.js
// Global registry for settings sections. Each section file registers itself and
// settings-renderer.js builds the sidebar and panels from this list. Sections are
// registered in script-load order (see settings.html), which is also sidebar order.
//
// A section is:
//   id             unique id, also the data-section value
//   title, icon    sidebar label and icon
//   template       static markup (trusted, developer-authored; never user data)
//   containerClass optional extra class for the panel (e.g. json-editor-container)
//   setup(root, ctx)      wire listeners once, called at build time
//   populate(root, ctx)   refresh dynamic content from ctx.settings
//   beforeSave(settings)  optional transform of the settings payload before saving
//
// Section templates are parsed with DOMParser by the renderer (never assigned
// as raw markup), and settings values are always written via value/textContent.
window.GenesisSettings = window.GenesisSettings || { sections: [] };

window.GenesisSettings.register = function register(section) {
  window.GenesisSettings.sections.push(section);
};
