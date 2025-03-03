export const MODE_NAME = Object.freeze({
  LOCAL: 'LOCAL',
  EMBEDDED: 'EMBEDDED',
  SERVER: 'SERVER'
})

const MODES = Object.freeze({
  [MODE_NAME.LOCAL]: {
    modeName: MODE_NAME.LOCAL,
    manageDocuments: true,
    previewHost: import.meta.env?.VITE_DS_PREVIEW_HOST
  },
  [MODE_NAME.EMBEDDED]: {
    modeName: MODE_NAME.EMBEDDED,
    manageDocuments: true,
    previewHost: import.meta.env?.VITE_DS_PREVIEW_HOST
  },
  [MODE_NAME.SERVER]: {
    modeName: MODE_NAME.SERVER,
    manageDocuments: false,
    previewHost: import.meta.env?.VITE_DS_PREVIEW_HOST
  }
})

export const getMode = (modeName = MODE_NAME.LOCAL) => {
  // Return the right values according to the mode or fallback to `local`
  return MODES[modeName.toUpperCase()] || MODES[MODE_NAME.LOCAL]
}
