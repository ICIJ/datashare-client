// SINGULAR
const EXTENSION = 'extension'
const PLUGIN = 'plugin'
export const ADDON_TYPE = Object.freeze({
  EXTENSION,
  PLUGIN
})
export const ADDON_TYPES = Object.values(ADDON_TYPE)

export const addonTypeValidator = (s) => ADDON_TYPES.includes(s.toLowerCase())

// PLURAL
const EXTENSIONS = 'extensions'
const PLUGINS = 'plugins'
export const ADDONS_TYPE = Object.freeze({
  EXTENSIONS,
  PLUGINS
})
export const ADDONS_TYPES = Object.values(ADDONS_TYPE)

export const addonsTypeValidator = (s) => ADDONS_TYPES.includes(s)
