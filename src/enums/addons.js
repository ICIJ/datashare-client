const EXTENSION = 'extension'
const PLUGIN = 'plugin'

export const ADDON_TYPE = Object.freeze({ EXTENSION, PLUGIN })
export const ADDON_TYPES = Object.values(ADDON_TYPE)

export const addonTypeValidator = (s) => ADDON_TYPES.includes(s.toLowerCase())
