import { createLocalVue, mount } from '@vue/test-utils'

import FilterSearch from '@/components/filter/FilterSearch'
import FilterText from '@/components/filter/types/FilterText'

import { Core } from '@/core'
import filters from '@/mixins/filters'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'

// Mock all api calls
jest.mock('@/api')
// Mock the refreshRouteAndSearch method to avoid unnecessary route update
filters.methods.refreshRoute = jest.fn()

describe('FilterSearch.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  const { index } = esConnectionHelper.build()
  let wrapper = null

  beforeEach(() => {
    store.commit('search/reset')
    store.commit('search/index', index)
    const filter = store.getters['search/getFilter']({ name: 'contentType' })

    wrapper = mount(FilterSearch, {
      i18n,
      localVue,
      store,
      wait,
      propsData: {
        filter,
        modelQuery: ''
      }
    })
  })

  afterAll(() => jest.unmock('@/api'))

  it('should have a filter component', async () => {
    await wrapper.vm.$nextTick()
    const filterComponent = wrapper.findComponent(FilterText)
    expect(filterComponent.exists()).toBeTruthy()
  })

  it('should have a filter component with a modelQuery', async () => {
    wrapper.setProps({ modelQuery: 'foo' })
    await wrapper.vm.$nextTick()
    const filterComponent = wrapper.findComponent(FilterText)
    expect(filterComponent.props('modelQuery')).toBe('foo')
    wrapper.setProps({ modelQuery: 'bar' })
    await wrapper.vm.$nextTick()
    expect(filterComponent.props('modelQuery')).toBe('bar')
  })
})
