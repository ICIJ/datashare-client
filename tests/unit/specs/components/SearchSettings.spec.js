import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { createLocalVue, shallowMount, createWrapper } from '@vue/test-utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/lang/en'
import router from '@/router'
import store from '@/store'
import SearchSettings from '@/components/SearchSettings'
import vBTooltip from 'bootstrap-vue/es/components/tooltip/tooltip'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.directive('b-tooltip', vBTooltip)
Vue.config.ignoredElements = ['font-awesome-icon']
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

describe('SearchSettings.vue', () => {
  esConnectionHelper()
  let wrapper
  // High timeout because multiple searches can be heavy for the Elasticsearch
  jest.setTimeout(1e4)

  beforeEach(() => {
    wrapper = shallowMount(SearchSettings, { localVue, i18n, store })
    store.commit('search/reset')
  })

  afterAll(() => {
    store.commit('search/reset')
  })

  it('should display the dropdown to choose the number of results per page', async () => {
    await store.commit('search/size', 10)
    wrapper = shallowMount(SearchSettings, { localVue, i18n, store })

    let e = wrapper.vm.$el.querySelector('#input-page-size')
    expect(e.options[e.selectedIndex].value).toEqual('10')
  })

  it('should display the dropdown to choose the order', async () => {
    await store.commit('search/sort', 'dateOldest')
    wrapper = shallowMount(SearchSettings, { localVue, i18n, store })

    let e = wrapper.vm.$el.querySelector('#input-sort')
    expect(e.options[e.selectedIndex].value).toEqual('dateOldest')
  })

  it('should not be relative to the search, by default', () => {
    expect(wrapper.vm.$el.querySelector('#input-global').checked).toEqual(false)
  })

  it('should emit a bv::hide::popover on relativeSearch change', () => {
    const rootWrapper = createWrapper(wrapper.vm.$root)
    wrapper.vm.relativeSearch = true

    expect(wrapper.vm.$el.querySelector('#input-global').checked).toEqual(true)
    expect(rootWrapper.emitted('bv::hide::popover')).toBeTruthy()
    expect(rootWrapper.emitted('bv::hide::popover').length).toEqual(1)
  })

  it('should call router push on facets reset', async () => {
    jest.spyOn(router, 'push')
    wrapper = shallowMount(SearchSettings, { localVue, i18n, router, store })

    expect(router.push).not.toHaveBeenCalled()
    wrapper.vm.resetFacets()
    expect(router.push).toHaveBeenCalled()
  })
})
