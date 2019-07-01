import Murmur from '@icij/murmur'
import ResetFiltersButton from '@/components/ResetFiltersButton'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import store from '@/store'
import router from '@/router'
import VueI18n from 'vue-i18n'
import messages from '@/lang/en'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('ResetFiltersButton.vue', function () {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(ResetFiltersButton, { localVue, i18n, router, store })
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
    expect(wrapper.vm.hasFacets).toBeFalsy()
  })

  it('should have facets', () => {
    store.commit('search/addFacetValue', { name: 'language', value: 'en' })
    expect(wrapper.vm.hasFacets).toBeTruthy()
  })

  it('should reset facets', () => {
    store.commit('search/addFacetValue', { name: 'language', value: 'en' })
    expect(wrapper.vm.hasFacets).toBeTruthy()
    wrapper.vm.resetFacets()
    expect(wrapper.vm.hasFacets).toBeFalsy()
  })

  it('should call router push on facets reset', () => {
    jest.spyOn(router, 'push')
    wrapper = shallowMount(ResetFiltersButton, { localVue, i18n, router, store })

    expect(router.push).not.toHaveBeenCalled()
    wrapper.vm.resetFacets()
    expect(router.push).toHaveBeenCalled()
  })

  it('should not change the globalSearch setting', () => {
    store.commit('search/setGlobalSearch', false)
    wrapper.vm.resetFacets()

    expect(store.state.search.globalSearch).toBeFalsy()
  })

  it('should emit an event "facet::search::reset-filters" on facets reset', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('facet::search::reset-filters', mockCallback)

    wrapper.vm.resetFacets()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })
})
