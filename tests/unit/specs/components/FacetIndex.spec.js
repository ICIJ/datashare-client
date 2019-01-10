import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import { createLocalVue, mount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue'
import FacetIndex from '@/components/FacetIndex'
import noop from 'lodash/noop'
import mixin from '@/mixins/facets'
import find from 'lodash/find'
import router from '@/router'
import store from '@/store'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import messages from '@/messages'
import fetchPonyfill from 'fetch-ponyfill'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Vuex)
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)

const i18n = new VueI18n({locale: 'en', messages})
const { Response } = fetchPonyfill()
const mockResponse = new Response(JSON.stringify([]),
  { status: 200, headers: { 'Content-type': 'application/json' } })
jest.mock('@/api/DatashareClient', () => {
  return jest.fn().mockImplementation(() => {
    return { getIndices: jest.fn().mockImplementation(() => { return Promise.resolve(mockResponse) }) }
  })
})

describe('FacetIndex.vue', () => {
  var wrapped = null

  beforeEach(async () => {
    mixin.methods.watchedForUpdate = noop
    wrapped = mount(FacetIndex, {
      localVue,
      i18n,
      router,
      store,
      propsData: { facet: find(store.state.search.facets, { name: 'leaks' }) }
    })
    wrapped.vm.root.isReady = true
  })

  it('should display an empty dropdown with only the local index by default', async () => {
    expect(wrapped.findAll('option')).toHaveLength(1)
    expect(wrapped.findAll('option').at(0).text()).toBe(process.env.VUE_APP_ES_INDEX)
  })
})
