import { isDoneStatus, DONE_TASK_STATUSES } from '@/enums/taskStatus'

describe('enums/taskStatus', () => {
  describe('isDoneStatus', () => {
    it.each(['done', 'success', 'ok'])('is true for the done status %s', (state) => {
      expect(isDoneStatus(state)).toBe(true)
    })

    it('is case-insensitive (DONE, SUCCESS, OK)', () => {
      expect(isDoneStatus('DONE')).toBe(true)
      expect(isDoneStatus('SUCCESS')).toBe(true)
      expect(isDoneStatus('OK')).toBe(true)
    })

    it.each(['running', 'queued', 'error', 'failed', 'cancelled'])('is false for non-done status %s', (state) => {
      expect(isDoneStatus(state)).toBe(false)
    })

    it('is false for an undefined state', () => {
      expect(isDoneStatus(undefined)).toBe(false)
    })

    it('exposes the canonical done set', () => {
      expect(DONE_TASK_STATUSES).toEqual(['done', 'success', 'ok'])
    })
  })
})
