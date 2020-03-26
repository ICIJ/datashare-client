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
  const index = toLower('FilterReadBy')
  let wrapper

  beforeAll(() => store.commit('search/index', index))

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
      url: Api.getFullUrl(`/api/${index}/documents/markReadUsers`)
    }))
    expect(wrapper.vm.readBy).toEqual(['user_01', 'user_02'])
  })

  it('should display users who read documents in this project', () => {
    expect(wrapper.findAll('.filter__items__item').at(0).text()).toBe('user_01')
    expect(wrapper.findAll('.filter__items__item').at(1).text()).toBe('user_02')
  })
})
