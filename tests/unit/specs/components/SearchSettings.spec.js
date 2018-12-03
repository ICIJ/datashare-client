import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import BootstrapVue from 'bootstrap-vue'
import { mount, createLocalVue } from '@vue/test-utils'

import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import SearchSettings from '@/components/SearchSettings'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Vuex)
localVue.use(VueProgressBar, { color: '#852308' })
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({ locale: 'en', messages })

describe('SearchSettings.vue', function () {
  esConnectionHelper()
  let wrapped = null
  // High timeout because multiple searches can be heavy for the Elasticsearch
  jest.setTimeout(1e4)

  beforeAll(() => {
    // Remove all facets to avoid unecessary request
    store.commit('search/clear')
    let settingsButton = document.createElement('button')
    settingsButton.setAttribute('id', 'toggleSettings')
    document.body.appendChild(settingsButton)
  })

  afterAll(() => {
    // And restore all facets!
    store.commit('search/reset')
  })

  it('should display the dropdown to choose the number of results per page', async () => {
    await store.commit('search/size', 10)
    wrapped = mount(SearchSettings, {localVue, i18n, router, store})

    let e = wrapped.vm.$el.querySelector('#input-page-size')
    expect(e.options[e.selectedIndex].value).toEqual('10')
  })

  it('should display the dropdown to choose the order', async () => {
    await store.commit('search/sort', 'dateOldest')
    wrapped = mount(SearchSettings, {localVue, i18n, router, store})

    let e = wrapped.vm.$el.querySelector('#input-sort')
    expect(e.options[e.selectedIndex].value).toEqual('dateOldest')
  })

  it('shouldn\'t have facets', async () => {
    wrapped = mount(SearchSettings, {localVue, i18n, router, store})
    await wrapped.vm.$store.dispatch('search/reset')
    expect(wrapped.vm.hasFacets).toEqual(false)
  })

  it('should have facets', async () => {
    wrapped = mount(SearchSettings, {localVue, i18n, router, store})
    await wrapped.vm.$store.dispatch('search/reset')
    expect(wrapped.vm.hasFacets).toEqual(false)
    await wrapped.vm.$store.commit('search/addFacetValue', { name: 'content-type', value: 'csv' })
    expect(wrapped.vm.hasFacets).toEqual(true)
  })

  it('should reset facets', async () => {
    wrapped = mount(SearchSettings, {localVue, i18n, router, store})
    await wrapped.vm.$store.commit('search/addFacetValue', { name: 'content-type', value: 'csv' })
    expect(wrapped.vm.hasFacets).toEqual(true)
    wrapped.vm.resetFacets()
    expect(wrapped.vm.hasFacets).toEqual(false)
  })

  it('should have an input unchecked for globalSearch', async () => {
    wrapped = mount(SearchSettings, {localVue, i18n, router, store})
    wrapped.vm.$store.commit('search/reset')
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.$el.querySelector('#input-global').checked).toEqual(true)
  })

  it('should have an input checked for globalSearch', async () => {
    wrapped = mount(SearchSettings, {localVue, i18n, router, store})
    wrapped.vm.$store.commit('search/setGlobalSearch', true)
    await wrapped.vm.$nextTick()
    expect(wrapped.vm.$el.querySelector('#input-global').checked).toEqual(true)
  })

  it('should call router push on facets reset', async () => {
    jest.spyOn(router, 'push')
    wrapped = mount(SearchSettings, { localVue, i18n, router, store })
    expect(router.push).not.toHaveBeenCalled()
    wrapped.vm.resetFacets()
    expect(router.push).toHaveBeenCalled()
  })
})
