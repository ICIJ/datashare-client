import find from 'lodash/find'
import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import axios from 'axios'

import Api from '@/api'
import FilterRecommendedBy from '@/components/FilterRecommendedBy'
import { Core } from '@/core'

Api.prototype.getUser = jest.fn().mockResolvedValue({ uid: 'test-user' })

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: [{ user: { id: 'user_01' }, count: 1 }, { user: { id: 'user_02' }, count: 3 }] })
  }
})

describe('FilterRecommendedBy.vue', () => {
  const { i18n, localVue, router, store, wait } = Core.init(createLocalVue()).useAll()
  const project = toLower('FilterRecommendedBy')
  let wrapper = null

  beforeAll(() => store.commit('search/index', project))

  beforeEach(async () => {
    wrapper = await shallowMount(FilterRecommendedBy, {
      i18n,
      localVue,
      router,
      store,
      wait,
      propsData: { filter: find(store.getters['search/instantiatedFilters'], { name: 'recommendedBy' }) }
    })
    await wrapper.vm.$nextTick()
  })

  afterAll(() => jest.unmock('axios'))

  it('should build a recommendedBy filter', () => {
    expect(wrapper.find('filter-boilerplate-stub').exists()).toBeTruthy()
  })

  it('should load users who recommended documents in this project', () => {
    axios.request.mockClear()
    wrapper = shallowMount(FilterRecommendedBy, {
      i18n,
      localVue,
      router,
      store,
      wait,
      propsData: { filter: find(store.getters['search/instantiatedFilters'], { name: 'recommendedBy' }) }
    })

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/users/recommendations?project=${project}`)
    }))
    expect(wrapper.vm.recommendedByUsers).toEqual([{ user: 'user_01', count: 1 }, { user: 'user_02', count: 3 }])
  })

  it('should retrieve documents recommended by selected users', async () => {
    const documents = ['document_01', 'document_02', 'document_03']
    axios.request.mockResolvedValue({ data: documents })
    axios.request.mockClear()

    await wrapper.vm.selectUsers(['user_01', 'user_02'])

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/${project}/documents/recommendations?userids=user_01,user_02`)
    }))
    expect(store.state.search.documentsRecommended).toEqual(documents)
    expect(wrapper.vm.selected).toEqual(['user_01', 'user_02'])
    expect(wrapper.vm.root.isAllSelected).toBeFalsy()
  })

  it('should select no users', async () => {
    axios.request.mockResolvedValue({ data: [] })
    axios.request.mockClear()

    await wrapper.vm.selectUsers([])

    expect(axios.request).toBeCalledTimes(0)
    expect(store.state.search.documentsRecommended).toEqual([])
    expect(wrapper.vm.selected).toEqual([])
    expect(wrapper.vm.root.isAllSelected).toBeTruthy()
  })

  it('should limit displayed users to 8', async () => {
    axios.request.mockResolvedValue({
      data: [
        { user: { id: 'user_01' }, doc_count: 1 },
        { user: { id: 'user_02' }, doc_count: 1 },
        { user: { id: 'user_03' }, doc_count: 1 },
        { user: { id: 'user_04' }, doc_count: 1 },
        { user: { id: 'user_05' }, doc_count: 1 },
        { user: { id: 'user_06' }, doc_count: 1 },
        { user: { id: 'user_07' }, doc_count: 1 },
        { user: { id: 'user_08' }, doc_count: 1 },
        { user: { id: 'user_09' }, doc_count: 1 },
        { user: { id: 'user_10' }, doc_count: 1 }
      ]
    })
    await store.dispatch('search/getRecommendationsByProject')

    expect(wrapper.findAll('.filter__items__item')).toHaveLength(8)
  })
})
