import { toProjectList } from '@/utils/projects'

describe('projects', () => {
  describe('toProjectList', () => {
    it('should wrap a bare project name into a list', () => {
      expect(toProjectList('local-datashare')).toEqual(['local-datashare'])
    })

    it('should wrap a project object into a list', () => {
      const project = { name: 'local-datashare' }
      expect(toProjectList(project)).toEqual([project])
    })

    it('should leave a list of project names untouched', () => {
      expect(toProjectList(['foo', 'bar'])).toEqual(['foo', 'bar'])
    })

    it('should return an empty list for undefined', () => {
      expect(toProjectList(undefined)).toEqual([])
    })

    it('should return an empty list for null', () => {
      expect(toProjectList(null)).toEqual([])
    })

    // A task with a blank defaultProject must not surface as a nameless project,
    // and an empty string is not nullish so it needs its own guard.
    it('should return an empty list for an empty string', () => {
      expect(toProjectList('')).toEqual([])
    })

    // Task lists build their project list positionally, as in [item.args?.defaultProject],
    // so a missing project arrives as a hole in an otherwise valid list.
    it('should drop missing entries from a list', () => {
      expect(toProjectList([undefined])).toEqual([])
      expect(toProjectList(['foo', undefined, ''])).toEqual(['foo'])
    })
  })
})
