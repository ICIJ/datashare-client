import { flushPromises, mount } from '@vue/test-utils'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'

import DisplayUser from '@/components/Display/DisplayUser'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeRecommendedBy from '@/components/Filter/FilterType/FilterTypeRecommendedBy'

describe('FilterTypeRecommendedBy.vue', () => {
  const { index, es: elasticsearch } = esConnectionHelper.build()
  let core, wrapper, api

  beforeAll(async () => {
    await letData(elasticsearch).have(new IndexedDocument('01', index)).commit()
    await letData(elasticsearch).have(new IndexedDocument('02', index)).commit()
    await letData(elasticsearch).have(new IndexedDocument('03', index)).commit()
  })

  beforeEach(async () => {
    vi.clearAllMocks()

    api = {
      elasticsearch,
      getRecommendationsByProject: vi.fn().mockResolvedValue({
        totalCount: 42,
        aggregates: [
          {
            item: { id: 'paul' },
            count: 2
          },
          {
            item: { id: 'local' },
            count: 1
          },
          {
            item: { id: 'anita' },
            count: 3
          }
        ]
      }),
      getDocumentsRecommendedBy: vi.fn(),
      getUser: vi.fn().mockResolvedValue({ uid: 'local' })
    }

    core = CoreSetup.init(api).useAll().useRouter()
    core.store.commit('search/index', index)

    const filter = core.store.getters['search/getFilter']({ name: 'recommendedBy' })
    const props = { filter }
    wrapper = await mount(FilterTypeRecommendedBy, { global: { plugins: core.plugins }, props })
    await wrapper.findComponent(FilterType).vm.aggregate()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should build a recommendedBy filter', () => {
    expect(wrapper.findComponent(FilterType).exists()).toBeTruthy()
  })

  it('should load users who recommended documents in this project', () => {
    expect(api.getRecommendationsByProject).toBeCalledWith(index)
    expect(wrapper.vm.state.recommended.byUsers).toEqual([
      { user: 'paul', count: 2 },
      { user: 'local', count: 1 },
      { user: 'anita', count: 3 }
    ])
  })

  it('should sort options to have the current user first', async () => {
    await flushPromises()
    expect(wrapper.findAllComponents(DisplayUser).at(0).text()).toBe('You')
  })

  it('should sort options by decreasing order', async () => {
    await flushPromises()
    expect(wrapper.findAllComponents(DisplayUser).at(0).text()).toBe('You')
    expect(wrapper.findAllComponents(DisplayUser).at(1).text()).toBe('anita')
    expect(wrapper.findAllComponents(DisplayUser).at(2).text()).toBe('paul')
  })

  it('should select no users', async () => {
    core.store.commit('search/addFilterValue', { name: 'recommendedBy', value: [] })
    await flushPromises()
    expect(api.getDocumentsRecommendedBy).toBeCalledTimes(0)
    expect(core.store.state.recommended.documents).toEqual([])
  })
})
