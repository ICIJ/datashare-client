import toLower from 'lodash/toLower'
import { mount } from '@vue/test-utils'

import CoreSetup from '~tests/unit/CoreSetup'
import FilterRecommendedBy from '@/components/Filter/types/FilterRecommendedBy'

// Mock the refreshRouteAndSearch method to avoid unecessary route update
FilterRecommendedBy.methods.refreshRouteAndSearch = vi.fn()

describe('FilterRecommendedBy.vue', () => {
  const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0))
  let core, wrapper, api
  const project = toLower('FilterRecommendedBy')

  beforeEach(async () => {
    vi.clearAllMocks()

    api = {
      getRecommendationsByProject: vi.fn().mockResolvedValue({
        totalCount: 42,
        aggregates: [
          {
            item: { id: 'user_00' },
            count: 2
          },
          {
            item: { id: 'user_01' },
            count: 1
          },
          {
            item: { id: 'user_02' },
            count: 3
          }
        ]
      }),
      getDocumentsRecommendedBy: vi.fn(),
      getUser: vi.fn().mockResolvedValue({ uid: 'user_01' })
    }

    core = CoreSetup.init(api).useAll().useRouter()
    core.store.commit('search/index', project)

    const filter = core.store.getters['search/getFilter']({ name: 'recommendedBy' })
    const props = { filter }
    const computed = { ...FilterRecommendedBy.computed, currentUserId: () => 'user_01' }
    wrapper = await mount(FilterRecommendedBy, { global: { plugins: core.plugins }, props, computed })
    await wrapper.vm.$nextTick()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should build a recommendedBy filter', () => {
    expect(wrapper.findComponent({ ref: 'filter' }).exists()).toBeTruthy()
  })

  it('should load users who recommended documents in this project', () => {
    expect(api.getRecommendationsByProject).toBeCalledWith(project)
    expect(wrapper.vm.recommendedByUsers).toEqual([
      { user: 'user_00', count: 2 },
      { user: 'user_01', count: 1 },
      { user: 'user_02', count: 3 }
    ])
  })

  it('should sort options to have the current user first', async () => {
    await flushPromises()
    expect(wrapper.findAll('.filter__items__item__label').at(0).text()).toBe('All')
    expect(wrapper.findAll('.filter__items__item__label').at(1).text()).toBe('You')
  })

  it('should sort options by decreasing order', async () => {
    await flushPromises()
    expect(wrapper.findAll('.filter__items__item__label').at(1).text()).toBe('You')
    expect(wrapper.findAll('.filter__items__item__label').at(2).text()).toBe('user_02')
    expect(wrapper.findAll('.filter__items__item__label').at(3).text()).toBe('user_00')
  })

  it('should retrieve documents recommended by selected users', async () => {
    const documents = ['document_01', 'document_02', 'document_03']
    api.getDocumentsRecommendedBy.mockResolvedValue(documents)
    await wrapper.vm.selectUsers(['user_01', 'user_02'])

    expect(api.getDocumentsRecommendedBy).toBeCalledWith(project, ['user_01', 'user_02'])
    expect(core.store.state.recommended.documents).toEqual(documents)
    expect(wrapper.vm.selected).toEqual(['user_01', 'user_02'])
    expect(wrapper.findComponent({ ref: 'filter' }).vm.isAllSelected).toBeFalsy()
  })

  it('should select no users', async () => {
    await wrapper.vm.selectUsers([])
    await wrapper.vm.$nextTick()

    expect(api.getDocumentsRecommendedBy).toBeCalledTimes(0)
    expect(core.store.state.recommended.documents).toEqual([])
    expect(wrapper.vm.selected).toEqual([])
    expect(wrapper.findComponent({ ref: 'filter' }).vm.isAllSelected).toBeTruthy()
  })
})
