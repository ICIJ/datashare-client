import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount, createWrapper } from '@vue/test-utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/lang/en'
import store from '@/store'
import router from '@/router'
import SearchSettings from '@/components/SearchSettings'
import vBTooltip from 'bootstrap-vue/es/directives/tooltip/tooltip'

jest.mock('v-calendar/lib/v-calendar.min.css', () => {})

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.directive('b-tooltip', vBTooltip)
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

  afterAll(() => store.commit('search/reset'))

  it('should not be relative to the search, by default', () => {
    expect(wrapper.vm.relativeSearch).toBeFalsy()
  })

  it('should display the dropdown to choose the number of results per page', async () => {
    expect(wrapper.findAll('#input-page-size')).toHaveLength(1)
    expect(wrapper.vm.selectedSize).toEqual(25)
  })

  it('should change the selectedSize via the dropdown', async () => {
    jest.spyOn(router, 'push')
    wrapper = shallowMount(SearchSettings, { localVue, i18n, store, router })
    const rootWrapper = createWrapper(wrapper.vm.$root)
    wrapper.findAll('#input-page-size option').at(3).setSelected()

    expect(wrapper.vm.selectedSize).toEqual('100')
    expect(router.push).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith({ name: 'search', query: { index: '', q: '', size: 100, sort: 'relevance', from: 0, field: 'all' } })
    expect(rootWrapper.emitted('bv::hide::popover')).toHaveLength(1)
  })

  it('should display the dropdown to choose the order', async () => {
    expect(wrapper.findAll('#input-sort')).toHaveLength(1)
    expect(wrapper.vm.selectedSort).toEqual('relevance')
  })

  it('should change the selectedSort via the dropdown', async () => {
    jest.spyOn(router, 'push')
    wrapper = shallowMount(SearchSettings, { localVue, i18n, store, router })
    const rootWrapper = createWrapper(wrapper.vm.$root)
    wrapper.findAll('#input-sort option').at(5).setSelected()

    expect(wrapper.vm.selectedSort).toEqual('sizeLargest')
    expect(router.push).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith({ name: 'search', query: { index: '', q: '', size: 25, sort: 'sizeLargest', from: 0, field: 'all' } })
    expect(rootWrapper.emitted('bv::hide::popover')).toHaveLength(1)
  })
})
