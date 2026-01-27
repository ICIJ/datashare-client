const SUCCESS = 'SUCCESS'
const IN_PROGRESS = 'IN_PROGRESS'
const FAILED = 'FAILED'
const PARTIAL = 'PARTIAL'

export const SNAPSHOT_STATUS = Object.freeze({
  SUCCESS,
  IN_PROGRESS,
  FAILED,
  PARTIAL
})

export const SNAPSHOT_STATUS_LIST = Object.values(SNAPSHOT_STATUS)
export const snapshotStatusValidator = v => SNAPSHOT_STATUS_LIST.includes(v)
