const prefix = 'org.icij.datashare.tasks'
const BATCH_SEARCH = `${prefix}.BatchSearchRunner`
const BATCH_SEARCH_PROXY = `${prefix}.BatchSearchRunnerProxy`
const BATCH_DOWNLOAD = `${prefix}.BatchDownloadRunner`
const SCAN = `${prefix}.ScanTask`
const INDEX = `${prefix}.IndexTask`
const EXTRACT_NLP = `${prefix}.ExtractNlpTask`
const ENQUEUE_FROM_INDEX = `${prefix}.EnqueueFromIndexTask`

export const TASK_NAME = Object.freeze({
  BATCH_SEARCH,
  BATCH_SEARCH_PROXY,
  BATCH_DOWNLOAD,
  SCAN,
  INDEX,
  EXTRACT_NLP,
  ENQUEUE_FROM_INDEX
})

export const TASK_NAME_ICON = Object.freeze({
  [BATCH_SEARCH]: 'list-magnifying-glass',
  [BATCH_SEARCH_PROXY]: 'list-magnifying-glass',
  [BATCH_DOWNLOAD]: 'download-simple',
  [SCAN]: 'files',
  [INDEX]: 'files',
  [EXTRACT_NLP]: 'users',
  [ENQUEUE_FROM_INDEX]: 'files'
})
export const HUMAN_TASK_NAME = Object.freeze({
  [BATCH_SEARCH]: 'taskNames.batchSearch',
  [BATCH_SEARCH_PROXY]: 'taskNames.batchSearch',
  [BATCH_DOWNLOAD]: 'taskNames.batchDownload',
  [SCAN]: 'taskNames.scan',
  [INDEX]: 'taskNames.index',
  [EXTRACT_NLP]: 'taskNames.extractNLP',
  [ENQUEUE_FROM_INDEX]: 'taskNames.enqueueFromIndex',
  UNKNOWN_TASK: 'taskNames.unknown'
})
export const TASK_NAME_LIST = Object.values(TASK_NAME)

export const taskNameValidator = (v) => TASK_NAME_LIST.includes(v)

export function getTaskName(longName) {
  return longName.split('.').pop()
}
export function getHumanTaskName(longName) {
  return taskNameValidator(longName) ? HUMAN_TASK_NAME[longName] : HUMAN_TASK_NAME.UNKNOWN_TASK
}
