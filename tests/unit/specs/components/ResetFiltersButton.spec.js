import ResetFiltersButton from '@/components/ResetFiltersButton'
import { shallowMount } from '@vue/test-utils'
import store from '@/store'
import router from '@/router'

describe('ResetFiltersButton.vue', function () {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ResetFiltersButton, { store, router })
    store.commit('search/reset')
  })

  it('should display a disabled button, by default', () => {
    expect(wrapper.find('.btn').exists()).toBeTruthy()
    expect(wrapper.find('.btn').attributes().disabled).toEqual('disabled')
  })

  it('should display an active button if a facet is valuated', () => {
    store.commit('search/addFacetValue', { name: 'language', value: 'en' })

    expect(wrapper.find('.btn').exists()).toBeTruthy()
    expect(wrapper.find('.btn[disabled]').exists()).toBeFalsy()
  })

  it('shouldn\'t have facets', () => {
    expect(wrapper.vm.hasFacets).toEqual(false)
  })

  it('should have facets', () => {
    store.commit('search/addFacetValue', { name: 'language', value: 'en' })
    expect(wrapper.vm.hasFacets).toEqual(true)
  })

  it('should reset facets', () => {
    store.commit('search/addFacetValue', { name: 'language', value: 'en' })
    expect(wrapper.vm.hasFacets).toEqual(true)
    wrapper.vm.resetFacets()
    expect(wrapper.vm.hasFacets).toEqual(false)
  })
})
