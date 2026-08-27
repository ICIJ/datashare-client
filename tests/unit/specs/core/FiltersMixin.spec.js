import { Core } from '@/core'
import { useSearchStore, useLockedFiltersStore } from '@/store/modules'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      createProject: vi.fn(),
      isDocumentDownloadable: vi.fn().mockResolvedValue(true),
      getUser: vi.fn(),
      getSettings: vi.fn().mockResolvedValue({}),
      getProject: vi.fn().mockResolvedValue({})
    }
  }
})

describe('FiltersMixin', () => {
  let core, searchStore

  beforeEach(() => {
    core = Core.init().useAll()
    searchStore = useSearchStore()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('register an email mixin', () => {
    core.registerFilter({
      type: 'FilterEntity',
      options: {
        order: 65,
        name: 'namedEntityEmail',
        key: 'byMentions',
        category: 'EMAIL'
      }
    })

    const filter = searchStore.getFilter({ name: 'namedEntityEmail' })
    expect(filter).toBeDefined()
  })

  it('should register the filter after the global event "datashare:ready"', () => {
    const core = Core.init().useAll()

    return new Promise((resolve) => {
      const ready = ({ detail }) => {
        detail.core.registerFilter({
          type: 'FilterEntity',
          options: {
            order: 65,
            name: 'namedEntityEmail',
            key: 'byMentions',
            category: 'EMAIL'
          }
        })

        const filter = searchStore.getFilter({ name: 'namedEntityEmail' })
        expect(filter).toBeDefined()
        resolve()
      }

      document.addEventListener('datashare:ready', ready, { once: true })

      return core.configure()
    })
  })

  it('preserves the user\'s locks when a filter is unregistered because the current project doesn\'t support it (icij/datashare#2332)', () => {
    // unregisterFilterForProject only hides the filter for the current
    // project selection - the user's personal, cross-project locks must
    // survive it, since registerFilter (called back when the project comes
    // around again) never restores them.
    core.registerFilter({
      type: 'FilterEntity',
      options: { order: 65, name: 'namedEntityEmail', key: 'byMentions', category: 'EMAIL' }
    })
    const lockedFiltersStore = useLockedFiltersStore()
    lockedFiltersStore.lock({ name: 'namedEntityEmail', value: 'foo@bar.com', label: 'foo@bar.com' })

    // toggleForProject fires withFn (unregister) when the current project
    // matches the given one - that's the "specialized-for-this-project" case.
    searchStore.setIndex('target-project')
    core.unregisterFilterForProject('target-project', 'namedEntityEmail')

    expect(searchStore.getFilter({ name: 'namedEntityEmail' })).toBeUndefined()
    expect(lockedFiltersStore.isLocked({ name: 'namedEntityEmail', value: 'foo@bar.com' })).toBe(true)
  })
})
