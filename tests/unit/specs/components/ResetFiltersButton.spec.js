import ResetFiltersButton from '@/components/ResetFiltersButton'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import store from '@/store'
import router from '@/router'
import VueI18n from 'vue-i18n'
import messages from '@/lang/en'

const localVue = createLocalVue()
localVue.use(VueI18n)
const i18n = new VueI18n({ locale: 'en', messages })

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
