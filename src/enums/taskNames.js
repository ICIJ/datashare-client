import { startCase } from 'lodash'

const BATCH_SEARCH = 'BatchSearchRunner'
const BATCH_DOWNLOAD = 'BatchDownloadRunner'
const SCAN = 'ScanTask'
const INDEX = 'IndexTask'
const EXTRACT_NLP = 'ExtractNlpTask'
const ENQUEUE_FROM_INDEX = 'EnqueueFromIndexTask'
export const TASK_NAME = Object.freeze({
  BATCH_SEARCH,
  BATCH_DOWNLOAD,
  SCAN,
  INDEX,
  EXTRACT_NLP,
  ENQUEUE_FROM_INDEX
})
export const HUMAN_TASK_NAME = Object.freeze({
  [BATCH_SEARCH]: 'Batch search',
  [BATCH_DOWNLOAD]: 'Batch download',
  [SCAN]: 'Scan',
  [INDEX]: 'Index',
  [EXTRACT_NLP]: 'Extract entities',
  [ENQUEUE_FROM_INDEX]: 'Enqueue from index'
})
export const TASK_NAME_LIST = Object.values(TASK_NAME)

export const taskNameValidator = (v) => TASK_NAME_LIST.includes(v)

export function getTaskName(longName) {
  return longName.split('.').pop()
}
export function getHumanTaskName(longName) {
  const taskName = getTaskName(longName)
  return taskNameValidator(taskName) ? HUMAN_TASK_NAME[taskName] : startCase(taskName)
}
