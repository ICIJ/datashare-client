import VueI18n from 'vue-i18n'
import Murmur from '@icij/murmur'
import BootstrapVue from 'bootstrap-vue'
import { createLocalVue, shallowMount, createWrapper } from '@vue/test-utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/lang/en'
import store from '@/store'
import VueRouter from 'vue-router'
import SearchSettings from '@/components/SearchSettings'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
localVue.use(VueRouter)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })
const router = new VueRouter()

describe('SearchSettings.vue', () => {
  esConnectionHelper()
  let wrapper
  // High timeout because multiple searches can be heavy for the Elasticsearch
  jest.setTimeout(1e4)

  beforeEach(() => {
    wrapper = shallowMount(SearchSettings, { localVue, i18n, store, sync: false })
    store.commit('search/reset')
  })

  afterAll(() => store.commit('search/reset'))

  it('should not be relative to the search, by default', () => {
    expect(wrapper.vm.relativeSearch).toBeFalsy()
  })

  it('should display the dropdown to choose the number of results per page', () => {
    expect(wrapper.findAll('#input-page-size')).toHaveLength(1)
    expect(wrapper.vm.selectedSize).toBe(store.state.search.size)
  })

  it('should change the selectedSize via the dropdown', async () => {
    jest.spyOn(router, 'push')
    wrapper = shallowMount(SearchSettings, { localVue, i18n, store, router, sync: false })
    const rootWrapper = createWrapper(wrapper.vm.$root)
    wrapper.findAll('#input-page-size option').at(3).setSelected()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedSize).toEqual(100)
    expect(router.push).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith({ name: 'search', query: { index: '', q: '', size: 100, sort: 'relevance', from: 0, field: 'all' } })
    expect(rootWrapper.emitted('bv::hide::popover')).toHaveLength(1)
  })

  it('should display the dropdown to choose the order', () => {
    expect(wrapper.findAll('#input-sort')).toHaveLength(1)
    expect(wrapper.vm.selectedSort).toBe(store.state.search.sort)
  })

  it('should change the selectedSort via the dropdown', async () => {
    jest.spyOn(router, 'push')
    wrapper = shallowMount(SearchSettings, { localVue, i18n, store, router, async: false })
    const rootWrapper = createWrapper(wrapper.vm.$root)
    wrapper.findAll('#input-sort option').at(5).setSelected()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.selectedSort).toEqual('sizeLargest')
    expect(router.push).toHaveBeenCalled()
    expect(router.push).toHaveBeenCalledWith({ name: 'search', query: { index: '', q: '', size: 25, sort: 'sizeLargest', from: 0, field: 'all' } })
    expect(rootWrapper.emitted('bv::hide::popover')).toHaveLength(1)
  })
})
