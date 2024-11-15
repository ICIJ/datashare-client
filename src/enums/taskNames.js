const BATCH_SEARCH = 'BatchSearchRunner'
const BATCH_DOWNLOAD = 'BatchDownloadRunner'
const SCAN = 'ScanTask'
const INDEX = 'IndexTask'
const EXTRACT_NLP = 'ExtractNlpTask'
export const TASK_NAMES = Object.freeze({
  BATCH_SEARCH,
  BATCH_DOWNLOAD,
  SCAN,
  INDEX,
  EXTRACT_NLP
})
export const taskNameValidator = (v) => TASK_NAMES.includes(v)

export function getTaskName(longName) {
  const taskName = longName.split('.').pop()
  if (taskNameValidator(taskName)) {
    return taskName
  }
  throw new Error(`Wrong task name ${longName}`)
}

export function getLongTaskName(shortName) {
  if (taskNameValidator(shortName)) {
    return `org.icij.datashare.tasks.${shortName}`
  }
  throw new Error(`Wrong task name ${shortName}`)
}
