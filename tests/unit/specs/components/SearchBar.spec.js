import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import VueProgressBar from 'vue-progressbar'
import BootstrapVue from 'bootstrap-vue'
import { mount, createLocalVue } from '@vue/test-utils'

import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import messages from '@/messages'
import router from '@/router'
import store from '@/store'

import trim from 'lodash/trim'

import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import SearchBar from '@/components/SearchBar'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Vuex)
localVue.use(VueProgressBar, { color: '#852308' })
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({ locale: 'en', messages })

describe('SearchBar.vue', function () {
  esConnectionHelper()
  let wrapped = null
  // High timeout because multiple searches can be heavy for the Elasticsearch
  jest.setTimeout(1e4)

  beforeAll(() => {
    // Remove all facets to avoid unecessary request
    store.commit('aggregation/clear')
    wrapped = mount(SearchBar, {localVue, i18n, router, store})
  })

  afterAll(() => {
    // And restore all facets!
    store.commit('aggregation/reset')
  })

  it('should display a search button', async () => {
    let e = wrapped.vm.$el.querySelector('button[type=submit]')
    expect(trim(e.textContent)).toEqual('Search')
  })

  it('should display a search settings button', async () => {
    let e = wrapped.vm.$el.querySelector('button[type=button]')
    expect(trim(e.textContent)).toEqual('Search settings')
  })

  it('should submmit search', async () => {
    wrapped.vm.query = 'foo'
    wrapped.vm.submit()
    expect(wrapped.vm.$store.state.search.query).toEqual('foo')
    wrapped.vm.query = 'bar'
    wrapped.vm.submit()
    expect(wrapped.vm.$store.state.search.query).toEqual('bar')
  })
})
