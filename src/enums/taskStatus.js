const SUCCESS = 'success'
const OK = 'ok'
const DONE = 'done'
const DANGER = 'danger'
const ERROR = 'error'
const FAIL = 'fail'
const FAILED = 'failed'
const FAILURE = 'failure'
const INFO = 'info'
const PENDING = 'pending'
const QUEUED = 'queued'
const DRAFT = 'draft'
const RUNNING = 'running'
const WARNING = 'warning'
const CANCELLED = 'cancelled'
const CREATED = 'created'

export const TASK_STATUS = Object.freeze({
  SUCCESS,
  OK,
  DONE,
  DANGER,
  ERROR,
  FAIL,
  FAILED,
  FAILURE,
  INFO,
  PENDING,
  QUEUED,
  DRAFT,
  RUNNING,
  WARNING,
  CANCELLED,
  CREATED
})

export const TASK_STATUS_LIST = Object.values(TASK_STATUS)
export const taskStatusValidator = v => TASK_STATUS_LIST.includes(v.toLowerCase())

// Canonical set of states that mean a task completed successfully. Mirrors the
// task store's `isDone` definition so consumers don't drift from it.
export const DONE_TASK_STATUSES = Object.freeze([DONE, SUCCESS, OK])
export const isDoneStatus = state => DONE_TASK_STATUSES.includes(state?.toLowerCase())
