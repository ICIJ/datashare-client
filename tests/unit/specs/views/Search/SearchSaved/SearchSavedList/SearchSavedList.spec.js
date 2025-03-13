import { flushPromises, mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import SearchSavedEntries from '@/components/Search/SearchSavedEntries/SearchSavedEntries'
import SearchSavedList from '@/views/Search/SearchSaved/SearchSavedList/SearchSavedList'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      removeHistoryEvent: vi.fn().mockResolvedValue({}),
      getHistoryEvents: vi.fn().mockResolvedValue({
        pagination: {
          total: 2,
          page: 1,
          size: 10
        },
        items: [
          {
            id: 'id_01',
            user: {
              id: 'user',
              name: null,
              email: null,
              provider: 'local'
            },
            creationDate: 'creation_date_01',
            modificationDate: 'modification_date_01',
            type: 'SEARCH',
            name: 'name_01',
            uri: 'uri_01'
          },
          {
            id: 'id_02',
            user: {
              id: 'user',
              name: null,
              email: null,
              provider: 'local'
            },
            creationDate: 'creation_date_02',
            modificationDate: 'modification_date_02',
            type: 'SEARCH',
            name: 'name_02',
            uri: 'uri_02'
          }
        ]
      })
    }
  }
})

describe('Search/SearchSaved/SearchSavedList.vue', () => {
  let wrapper, router

  beforeEach(async () => {
    const core = CoreSetup.init().useAll().useRouterWithoutGuards()
    const global = { plugins: core.plugins }
    router = core.router
    wrapper = mount(SearchSavedList, { global })
    await flushPromises()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should display a list of 2 saved search', () => {
    const entries = wrapper.findComponent(SearchSavedEntries)
    expect(entries.exists()).toBeTruthy()
    const tr = entries.findAll('.page-table-generic__row')
    expect(tr).toHaveLength(2)
  })

  it('should display load next page', async () => {
    expect(api.getHistoryEvents).toBeCalledTimes(1)
    await router.push({ name: 'search.saved.list', query: { page: '2' } })
    expect(api.getHistoryEvents).toBeCalledTimes(2)
  })
})
