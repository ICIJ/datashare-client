import { mount, flushPromises } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import ButtonToggleDay from '@/components/Button/ButtonToggleDay'
import DocumentCard from '@/components/Document/DocumentCard/DocumentCard'
import SearchHistoryList from '@/views/Search/SearchHistory/SearchHistoryList/SearchHistoryList'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', () => {
  return {
    apiInstance: {
      elasticsearch: {
        search: vi.fn()
      },
      isDownloadAllowed: vi.fn().mockResolvedValue(),
      removeHistoryEvent: vi.fn().mockResolvedValue({}),
      getStarredDocuments: vi.fn().mockResolvedValue([]),
      retrieveNotes: vi.fn().mockResolvedValue([]),
      getHistoryEvents: vi.fn().mockResolvedValue({
        pagination: {
          total: 0,
          page: 1,
          size: 10
        },
        items: []
      })
    }
  }
})

describe('SearchHistoryList.vue', () => {
  let core

  beforeEach(async () => {
    const index = 'local-datashare'
    core = CoreSetup.init().useAll().useRouterWithoutGuards()

    api.elasticsearch.search.mockResolvedValue({
      hits: {
        total: 2,
        hits: [
          {
            _id: 'foo',
            _index: 'local-datashare',
            _source: {
              name: 'name_01'
            }
          },
          {
            _id: 'bar',
            _index: 'local-datashare',
            _source: {
              name: 'name_02'
            }
          }
        ]
      }
    })

    api.getHistoryEvents.mockResolvedValue({
      pagination: {
        total: 2,
        page: 1,
        size: 10
      },
      items: [
        {
          id: 'id_02',
          user: {
            id: 'user',
            name: null,
            email: null,
            provider: 'local'
          },
          creationDate: '2023-02-14T14:00:32.683+00:00',
          modificationDate: '2023-02-14T14:00:32.683+00:00',
          type: 'DOCUMENT',
          name: 'name_02',
          uri: `/ds/${index}/bar/bar`
        },
        {
          id: 'id_01',
          user: {
            id: 'user',
            name: null,
            email: null,
            provider: 'local'
          },
          creationDate: '2023-02-15T11:00:32.683+00:00',
          modificationDate: '2023-02-15T12:16:32.683+00:00',
          type: 'DOCUMENT',
          name: 'name_01',
          uri: `/ds/${index}/foo/foo`
        }
      ]
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should display a list of two documents', async () => {
    const wrapper = mount(SearchHistoryList, { global: { plugins: core.plugins } })
    await flushPromises()
    const cards = wrapper.findAllComponents(DocumentCard)
    expect(cards).toHaveLength(2)
  })

  it('should display a button for each day', async () => {
    const wrapper = mount(SearchHistoryList, { global: { plugins: core.plugins } })
    await flushPromises()
    const cards = wrapper.findAllComponents(ButtonToggleDay)
    expect(cards).toHaveLength(2)
  })
})
