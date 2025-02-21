import { Core } from '@/core'
import { useSearchStore } from '@/store/modules'

describe('FiltersMixin', () => {
  let api, core, searchStore

  beforeEach(() => {
    api = {
      createProject: vi.fn(),
      isDownloadAllowed: vi.fn(),
      getUser: vi.fn(),
      getSettings: vi.fn().mockResolvedValue({}),
      getProject: vi.fn().mockResolvedValue({})
    }

    core = Core.init(api).useAll()
    searchStore = useSearchStore()
  })

  it('register an email mixin', () => {
    core.registerFilter({
      type: 'FilterNamedEntity',
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
    const core = Core.init(api).useAll()

    return new Promise((resolve) => {
      const ready = ({ detail }) => {
        detail.core.registerFilter({
          type: 'FilterNamedEntity',
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
})
