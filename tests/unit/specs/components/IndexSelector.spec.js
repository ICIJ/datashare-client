import Vuex from 'vuex'
import VueI18n from 'vue-i18n'
import { createLocalVue, mount } from '@vue/test-utils'
import BootstrapVue from 'bootstrap-vue'
import IndexSelector from '@/components/IndexSelector'
import find from 'lodash/find'
import router from '@/router'
import store from '@/store'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
import messages from '@/messages'
import DatashareClient from '@/api/DatashareClient'
import fetchPonyfill from 'fetch-ponyfill'
const { Response } = fetchPonyfill()

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Vuex)
localVue.use(BootstrapVue)
localVue.component('font-awesome-icon', FontAwesomeIcon)
const i18n = new VueI18n({locale: 'en', messages})

jest.mock('@/api/DatashareClient', () => jest.fn())

describe('IndexSelector.vue', () => {
  it('should display an empty dropdown with only the local index by default', async () => {
    DatashareClient.mockImplementation(() => {
      return {
        getIndices: () => {
          return Promise.resolve(new Response(JSON.stringify([]),
            { status: 200, headers: { 'Content-type': 'application/json' } }))
        }
      }
    })
    const wrapped = mount(IndexSelector, { localVue, i18n, router, store, propsData: { facet: find(store.state.search.facets, { name: 'leaks' }) } })
    await wrapped.vm.$nextTick()
    await wrapped.vm.$nextTick()
    expect(wrapped.findAll('option')).toHaveLength(1)
    expect(wrapped.findAll('option').at(0).text()).toBe(process.env.VUE_APP_ES_INDEX)
  })

  it('should display another empty dropdown with only the local index by default', async () => {
    DatashareClient.mockImplementation(() => {
      return {
        getIndices: () => {
          return Promise.resolve(new Response(JSON.stringify(['first-index', 'second-index']),
            { status: 200, headers: { 'Content-type': 'application/json' } }))
        }
      }
    })
    const wrapped = mount(IndexSelector, { localVue, i18n, router, store, propsData: { facet: find(store.state.search.facets, { name: 'leaks' }) } })
    await wrapped.vm.$nextTick()
    await wrapped.vm.$nextTick()
    expect(wrapped.findAll('option')).toHaveLength(3)
    expect(wrapped.findAll('option').at(0).text()).toBe(process.env.VUE_APP_ES_INDEX)
    expect(wrapped.findAll('option').at(1).text()).toBe('first-index')
    expect(wrapped.findAll('option').at(2).text()).toBe('second-index')
  })
})
