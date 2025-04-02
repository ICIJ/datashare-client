import { Core } from '@/core'
import { useSearchStore } from '@/store/modules'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      createProject: vi.fn(),
      isDownloadAllowed: vi.fn(),
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
})
