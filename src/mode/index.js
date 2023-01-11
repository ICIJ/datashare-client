export const MODE_NAME = Object.freeze({
  LOCAL: 'LOCAL',
  SERVER: 'SERVER'
})

const MODES = Object.freeze({
  [MODE_NAME.LOCAL]: {
    modeName: 'local',
    multipleProjects: false,
    manageDocuments: true
  },
  [MODE_NAME.SERVER]: {
    modeName: 'server',
    multipleProjects: true,
    manageDocuments: false
  }
})

export const getMode = (modeName = MODE_NAME.LOCAL) => {
  // Return the right values according to the mode or fallback to `local`
  return MODES[modeName.toLowerCase()] || MODES[MODE_NAME.LOCAL]
}
