import { TASK_TYPE, TASK_TYPE_LIST, taskTypeValidator } from '@/enums/taskTypes'

describe('taskTypes enum', () => {
  it('exposes the backend TaskType names the UI needs', () => {
    expect(TASK_TYPE).toEqual({
      BATCH_SEARCH: 'BATCH_SEARCH',
      BATCH_DOWNLOAD: 'BATCH_DOWNLOAD',
      INDEX: 'INDEX',
      SCAN: 'SCAN',
      EXTRACT_NLP: 'EXTRACT_NLP',
      ENQUEUE_FROM_INDEX: 'ENQUEUE_FROM_INDEX'
    })
  })

  it('is frozen', () => {
    expect(Object.isFrozen(TASK_TYPE)).toBe(true)
  })

  it('lists all type values', () => {
    expect(TASK_TYPE_LIST).toEqual([
      'BATCH_SEARCH',
      'BATCH_DOWNLOAD',
      'INDEX',
      'SCAN',
      'EXTRACT_NLP',
      'ENQUEUE_FROM_INDEX'
    ])
  })

  it('validates known and unknown types', () => {
    expect(taskTypeValidator('SCAN')).toBe(true)
    expect(taskTypeValidator('NOPE')).toBe(false)
  })
})
