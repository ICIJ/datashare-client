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
    request: jest.fn().mockResolvedValue({ data: [{ id: 'user_01' }, { id: 'user_02' }] })
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
      propsData: {
        filter: find(store.getters['search/instantiatedFilters'], {
          name: 'recommendedBy'
        })
      }
    })
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
    expect(wrapper.vm.recommendedByUsers).toEqual(['user_01', 'user_02'])
  })

  it('should display users who recommended documents in this project', () => {
    expect(wrapper.findAll('.filter__items__item').at(0).text()).toBe('user_01')
    expect(wrapper.findAll('.filter__items__item').at(1).text()).toBe('user_02')
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
})
