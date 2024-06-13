import { Core } from '@/core'

describe('FiltersMixin', () => {
  let api, core

  beforeEach(() => {
    api = {
      createProject: vi.fn(),
      isDownloadAllowed: vi.fn(),
      getUser: vi.fn(),
      getSettings: vi.fn().mockResolvedValue({}),
      getProject: vi.fn().mockResolvedValue({})
    }
  })

  it('register an email mixin', () => {
    core = Core.init(api).useAll()
    core.registerFilter({
      type: 'FilterNamedEntity',
      options: {
        order: 65,
        name: 'namedEntityEmail',
        key: 'byMentions',
        category: 'EMAIL',
        isSearchable: true
      }
    })

    const filter = core.store.getters['search/getFilter']({ name: 'namedEntityEmail' })
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
            category: 'EMAIL',
            isSearchable: true
          }
        })

        const filter = core.store.getters['search/getFilter']({ name: 'namedEntityEmail' })
        expect(filter).toBeDefined()
        resolve()
      }

      document.addEventListener('datashare:ready', ready, { once: true })

      return core.configure()
    })
  })
})
