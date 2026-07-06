const BATCH_SEARCH = 'BATCH_SEARCH'
const BATCH_DOWNLOAD = 'BATCH_DOWNLOAD'
const INDEX = 'INDEX'
const SCAN = 'SCAN'
const EXTRACT_NLP = 'EXTRACT_NLP'
const ENQUEUE_FROM_INDEX = 'ENQUEUE_FROM_INDEX'

export const TASK_TYPE = Object.freeze({
  BATCH_SEARCH,
  BATCH_DOWNLOAD,
  INDEX,
  SCAN,
  EXTRACT_NLP,
  ENQUEUE_FROM_INDEX
})

export const TASK_TYPE_LIST = Object.values(TASK_TYPE)

export const taskTypeValidator = v => TASK_TYPE_LIST.includes(v)
