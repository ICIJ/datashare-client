import { mount } from '@vue/test-utils'

import esConnectionHelper from '~tests/unit/specs/utils/esConnectionHelper'
import FilterSearch from '@/components/Filter/FilterSearch'
import FilterText from '@/components/Filter/types/FilterText'
import CoreSetup from '~tests/unit/CoreSetup'
import filters from '@/mixins/filters'

// Mock all api calls
vi.mock('@/api')
// Mock the refreshRouteAndSearch method to avoid unnecessary route update
filters.methods.refreshRoute = vi.fn()

describe('FilterSearch.vue', () => {
  const { index, es } = esConnectionHelper.build()
  const api = { elasticsearch: es }
  let wrapper = null

  beforeEach(() => {
    const { plugins, store } = CoreSetup.init(api).useAll()
    const filter = store.getters['search/getFilter']({ name: 'contentType' })
    store.commit('search/reset')
    store.commit('search/index', index)

    wrapper = mount(FilterSearch, {
      global: {
        plugins
      },
      props: {
        filter,
        modelQuery: ''
      }
    })
  })

  afterAll(() => {
    vi.unmock('@/api')
  })

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
