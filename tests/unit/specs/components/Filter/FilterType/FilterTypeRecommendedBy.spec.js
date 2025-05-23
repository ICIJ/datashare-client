import { flushPromises, mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import { IndexedDocument, letData } from '~tests/unit/es_utils'
import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import CoreSetup from '~tests/unit/CoreSetup'
import DisplayUser from '@/components/Display/DisplayUser'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeRecommendedBy from '@/components/Filter/FilterType/FilterTypeRecommendedBy'
import { useSearchStore, useRecommendedStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

vi.mock('@/api/apiInstance', async (importOriginal) => {
  const { apiInstance } = await importOriginal()

  return {
    apiInstance: {
      ...apiInstance,
      getDocumentsRecommendedBy: vi.fn(),
      getUser: vi.fn().mockResolvedValue({ uid: 'local' }),
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
      })
    }
  }
})

describe('FilterTypeRecommendedBy.vue', () => {
  const { index, es } = esConnectionHelper.build()
  let core, wrapper, recommendedStore, searchStore

  beforeAll(async () => {
    await letData(es).have(new IndexedDocument('01', index)).commit()
    await letData(es).have(new IndexedDocument('02', index)).commit()
    await letData(es).have(new IndexedDocument('03', index)).commit()
  })

  beforeEach(async () => {
    setActivePinia(createPinia())
    core = CoreSetup.init().useAll().useRouterWithoutGuards()
    recommendedStore = useRecommendedStore()
    searchStore = useSearchStore()
    searchStore.setIndex(index)

    window.datashare = core

    const filter = searchStore.getFilter({ name: 'recommendedBy' })
    const props = { filter }
    wrapper = await mount(FilterTypeRecommendedBy, { global: { plugins: core.plugins }, props })
    await wrapper.findComponent(FilterType).vm.aggregate()
  })

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should build a recommendedBy filter', () => {
    expect(wrapper.findComponent(FilterType).exists()).toBeTruthy()
  })

  it('should load users who recommended documents in this project', () => {
    expect(api.getRecommendationsByProject).toBeCalledWith(index)
    expect(recommendedStore.byUsers).toEqual([
      { user: 'paul', count: 2 },
      { user: 'local', count: 1 },
      { user: 'anita', count: 3 }
    ])
  })

  it('should sort options to have the current user first', async () => {
    await flushPromises()
    expect(wrapper.findAllComponents(DisplayUser).at(0).text()).toBe('local (you)')
  })

  it('should sort options by decreasing order', async () => {
    await flushPromises()
    expect(wrapper.findAllComponents(DisplayUser).at(0).text()).toBe('local (you)')
    expect(wrapper.findAllComponents(DisplayUser).at(1).text()).toBe('anita')
    expect(wrapper.findAllComponents(DisplayUser).at(2).text()).toBe('paul')
  })

  it('should select no users', async () => {
    searchStore.addFilterValue({ name: 'recommendedBy', value: [] })
    await flushPromises()
    expect(api.getDocumentsRecommendedBy).toBeCalledTimes(0)
    expect(recommendedStore.documents).toEqual([])
  })
})
