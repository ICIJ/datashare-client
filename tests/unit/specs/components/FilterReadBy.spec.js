import find from 'lodash/find'
import toLower from 'lodash/toLower'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import axios from 'axios'

import Api from '@/api'
import FilterReadBy from '@/components/FilterReadBy'
import { Core } from '@/core'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: [{ id: 'user_01' }, { id: 'user_02' }] })
  }
})

const { i18n, localVue, router, store, wait } = Core.init(createLocalVue()).useAll()

describe('FilterReadBy.vue', () => {
  const project = toLower('FilterReadBy')
  let wrapper

  beforeAll(() => store.commit('search/index', project))

  beforeEach(async () => {
    wrapper = shallowMount(FilterReadBy, {
      i18n,
      localVue,
      router,
      store,
      wait,
      propsData: { filter: find(store.getters['search/instantiatedFilters'], { name: 'readBy' }) }
    })
    await wrapper.vm.$nextTick()
  })

  afterAll(() => jest.unmock('axios'))

  it('should build a readBy filter', () => {
    expect(wrapper.find('filter-boilerplate-stub').exists()).toBeTruthy()
  })

  it('should load users who read documents in this project', async () => {
    axios.request.mockClear()
    wrapper = shallowMount(FilterReadBy, {
      i18n,
      localVue,
      router,
      store,
      wait,
      propsData: { filter: find(store.getters['search/instantiatedFilters'], { name: 'readBy' }) }
    })
    await wrapper.vm.$nextTick()

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/${project}/documents/readBy`)
    }))
    expect(wrapper.vm.readByUsers).toEqual(['user_01', 'user_02'])
  })

  it('should display users who read documents in this project', async () => {
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.filter__items__item').at(0).text()).toBe('user_01')
    expect(wrapper.findAll('.filter__items__item').at(1).text()).toBe('user_02')
  })

  it('should retrieve documents read by selected users', async () => {
    const documents = ['document_01', 'document_02', 'document_03']
    axios.request.mockResolvedValue({ data: documents })
    axios.request.mockClear()

    await wrapper.vm.selectUsers(['user_01', 'user_02'])

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/${project}/documents/documentsReadBy/user_01,user_02`)
    }))
    expect(store.state.search.documentsRead).toEqual(documents)
    expect(wrapper.vm.selected).toEqual(['user_01', 'user_02'])
    expect(wrapper.vm.root.isAllSelected).toBeFalsy()
  })

  it('should select no users', async () => {
    axios.request.mockResolvedValue({ data: [] })
    axios.request.mockClear()

    await wrapper.vm.selectUsers([])

    expect(axios.request).toBeCalledTimes(1)
    expect(axios.request).toBeCalledWith(expect.objectContaining({
      url: Api.getFullUrl(`/api/${project}/documents/documentsReadBy/`)
    }))
    expect(store.state.search.documentsRead).toEqual([])
    expect(wrapper.vm.selected).toEqual([])
    expect(wrapper.vm.root.isAllSelected).toBeTruthy()
  })
})
