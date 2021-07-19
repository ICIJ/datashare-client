import toLower from 'lodash/toLower'
import { createLocalVue, mount } from '@vue/test-utils'
import axios from 'axios'

import Api from '@/api'
import FilterRecommendedBy from '@/components/filter/types/FilterRecommendedBy'
import { Core } from '@/core'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({
      data: {
        totalCount: 42,
        aggregates: [
          { item: { id: 'user_00' }, count: 2 },
          { item: { id: 'user_01' }, count: 1 },
          { item: { id: 'user_02' }, count: 3 }
        ]
      }
    })
  }
})

jest.mock('@/api/resources/Auth', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getUsername: jest.fn().mockImplementation(() => {
        return Promise.resolve('user_01')
      })
    }
  })
})

// Mock the refreshRouteAndSearch method to avoid unecessary route update
FilterRecommendedBy.methods.refreshRouteAndSearch = jest.fn()

describe('FilterRecommendedBy.vue', () => {
  const flushPromises = () => new Promise(resolve => setImmediate(resolve))
  const { i18n, localVue, router, store, wait } = Core.init(createLocalVue()).useAll()
  const project = toLower('FilterRecommendedBy')
  const filter = store.getters['search/getFilter']({ name: 'recommendedBy' })
  const propsData = { filter }
  const computed = { currentUserId: () => 'user_01' }
  let wrapper = null

  beforeAll(() => store.commit('search/index', project))

  beforeEach(async () => {
    axios.request.mockClear()
    wrapper = await mount(FilterRecommendedBy, { i18n, localVue, router, store, wait, propsData, computed })
    await wrapper.vm.$nextTick()
  })

  afterAll(() => {
    jest.unmock('axios')
    jest.unmock('@/api/resources/Auth')
  })

  it('should build a recommendedBy filter', () => {
    expect(wrapper.findComponent({ ref: 'filter' }).exists()).toBeTruthy()
  })

  it('should load users who recommended documents in this project', () => {
    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/users/recommendations?project=${project}`)
    }))
    expect(wrapper.vm.recommendedByUsers).toEqual([
      { user: 'user_00', count: 2 },
      { user: 'user_01', count: 1 },
      { user: 'user_02', count: 3 }
    ])
    expect(wrapper.vm.recommendedByTotal).toBe(42)
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
    axios.request.mockResolvedValue({ data: documents })
    axios.request.mockClear()
    await wrapper.vm.selectUsers(['user_01', 'user_02'])

    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/${project}/documents/recommendations?userids=user_01,user_02`)
    }))
    expect(store.state.search.documentsRecommended).toEqual(documents)
    expect(wrapper.vm.selected).toEqual(['user_01', 'user_02'])
    expect(wrapper.findComponent({ ref: 'filter' }).vm.isAllSelected).toBeFalsy()
  })

  it('should select no users', async () => {
    wrapper = await mount(FilterRecommendedBy, { i18n, localVue, router, store, wait, propsData })
    axios.request.mockResolvedValue({ data: [] })
    axios.request.mockClear()

    await wrapper.vm.selectUsers([])
    await wrapper.vm.$nextTick()

    expect(axios.request).toBeCalledTimes(0)
    expect(store.state.search.documentsRecommended).toEqual([])
    expect(wrapper.vm.selected).toEqual([])
    expect(wrapper.findComponent({ ref: 'filter' }).vm.isAllSelected).toBeTruthy()
  })
})
