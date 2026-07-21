import {
  TASK_NAME,
  HUMAN_TASK_NAME,
  registerTaskName,
  getRegisteredTaskName,
  getHumanTaskName,
  taskNameValidator
} from '@/enums/taskNames'

describe('taskNames enum', () => {
  describe('built-in task names', () => {
    it('validates known task names', () => {
      expect(taskNameValidator(TASK_NAME.BATCH_SEARCH)).toBe(true)
      expect(taskNameValidator(TASK_NAME.BATCH_DOWNLOAD)).toBe(true)
    })

    it('rejects unknown task names', () => {
      expect(taskNameValidator('some.unknown.task')).toBe(false)
    })

    it('returns human name for known tasks', () => {
      expect(getHumanTaskName(TASK_NAME.BATCH_SEARCH)).toBe(HUMAN_TASK_NAME[TASK_NAME.BATCH_SEARCH])
    })

    it('returns unknown for unregistered tasks', () => {
      expect(getHumanTaskName('some.unknown.task')).toBe(HUMAN_TASK_NAME.UNKNOWN_TASK)
    })
  })

  describe('registerTaskName', () => {
    const customName = 'test.custom.task'

    beforeEach(() => {
      registerTaskName(customName, {
        icon: 'custom-icon',
        title: 'custom.title',
        listRoute: { name: 'task.custom' },
        linkTitle: 'custom.linkTitle',
        getProjects: item => [item.args?.project],
        getTitle: item => item.args?.name
      })
    })

    it('validates a registered custom task name', () => {
      expect(taskNameValidator(customName)).toBe(true)
    })

    it('returns the registered config via getRegisteredTaskName', () => {
      const config = getRegisteredTaskName(customName)
      expect(config.icon).toBe('custom-icon')
      expect(config.title).toBe('custom.title')
      expect(config.listRoute).toEqual({ name: 'task.custom' })
      expect(config.linkTitle).toBe('custom.linkTitle')
    })

    it('returns custom title from getHumanTaskName', () => {
      expect(getHumanTaskName(customName)).toBe('custom.title')
    })

    it('calls getProjects with the task item', () => {
      const config = getRegisteredTaskName(customName)
      const item = { args: { project: 'my-project' } }
      expect(config.getProjects(item)).toEqual(['my-project'])
    })

    it('calls getTitle with the task item', () => {
      const config = getRegisteredTaskName(customName)
      const item = { args: { name: 'my-document.mp3' } }
      expect(config.getTitle(item)).toBe('my-document.mp3')
    })

    it('returns undefined for an unregistered name', () => {
      expect(getRegisteredTaskName('not.registered')).toBeUndefined()
    })
  })
})
