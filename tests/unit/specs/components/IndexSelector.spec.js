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
DatashareClient.mockImplementation(() => {
  return {
    getIndices: () => {
      return Promise.resolve(new Response(JSON.stringify([]),
        { status: 200, headers: { 'Content-type': 'application/json' } }))
    }
  }
})

describe('IndexSelector.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(IndexSelector, { localVue, i18n, router, store, propsData: { facet: find(store.state.search.facets, { name: 'leaks' }) } })
  })

  it('should not display a dropdown containing only the local index', () => {
    expect(wrapper.findAll('option')).toHaveLength(0)
  })

  it('should select the local index as default selected index', () => {
    expect(wrapper.vm.selected).toBe(process.env.VUE_APP_ES_INDEX)
  })

  it('should display a dropdown containing 2 indices', async () => {
    DatashareClient.mockImplementation(() => {
      return {
        getIndices: () => {
          return Promise.resolve(new Response(JSON.stringify(['first-index', 'second-index']),
            { status: 200, headers: { 'Content-type': 'application/json' } }))
        }
      }
    })
    wrapper = mount(IndexSelector, { localVue, i18n, router, store, propsData: { facet: find(store.state.search.facets, { name: 'leaks' }) } })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('option')).toHaveLength(2)
    expect(wrapper.findAll('option').at(0).text()).toBe('first-index')
    expect(wrapper.findAll('option').at(1).text()).toBe('second-index')
  })

  it('should change the selected index and refresh the route', async () => {
    DatashareClient.mockImplementation(() => {
      return {
        getIndices: () => {
          return Promise.resolve(new Response(JSON.stringify(['first-index', 'second-index']),
            { status: 200, headers: { 'Content-type': 'application/json' } }))
        }
      }
    })
    wrapper = mount(IndexSelector, { localVue, i18n, router, store, propsData: { facet: find(store.state.search.facets, { name: 'leaks' }) } })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const spyRefreshRoute = jest.spyOn(wrapper.vm, 'refreshRoute')
    expect(spyRefreshRoute).not.toBeCalled()

    wrapper.findAll('option').at(1).element.selected = true
    wrapper.find('select').trigger('change')

    expect(spyRefreshRoute).toBeCalled()
    expect(spyRefreshRoute).toBeCalledTimes(1)
    expect(wrapper.vm.$store.getters['search/toRouteQuery'].index).toEqual('second-index')
  })
})
