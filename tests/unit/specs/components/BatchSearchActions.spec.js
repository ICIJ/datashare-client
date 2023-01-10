import VueRouter from 'vue-router'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import { flushPromises } from 'tests/unit/tests_utils'
import { Core } from '@/core'
import BatchSearchActions from '@/components/BatchSearchActions'
import { getMode, MODE_NAME } from '@/mode'
import { Api } from '@/api'
import Vuex from 'vuex'
import { getters, mutations, actionBuilder } from '@/store/modules/batchSearch'

describe('BatchSearchActions.vue', () => {
  let wrapper, i18n, localVue, store, wait, router, api

  const propsData = {
    batchSearch: {
      uuid: '12',
      projects: [
        {
          name: 'BatchSearchActions'
        }
      ],
      name: 'BatchSearch Test',
      description: 'This is the description of the batch search',
      state: 'SUCCESS',
      date: '2019-07-18T14:45:34.869+0000',
      nbResults: 333,
      phraseMatch: 1,
      fuzziness: 1,
      fileTypes: [],
      paths: [],
      published: true,
      user: {
        id: 'test'
      }
    }
  }

  beforeAll(() => {
    api = new Api(null, null)
    const core = Core.init(createLocalVue(), api, getMode(MODE_NAME.SERVER)).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
    const routes = [
      {
        name: 'batch-search.results',
        path: 'batch-search/:index/:uuid'
      },
      {
        name: 'document-standalone',
        path: '/ds/:index/:id/:routing?'
      }
    ]
    router = new VueRouter({ routes })
  })

  beforeEach(async () => {
    await router.push({ name: 'batch-search.results' }).catch(() => {}) // TODO only for the last test?
    await flushPromises()
  })

  afterEach(() => {
    store.commit('batchSearch/reset')
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
    wrapper.vm.$core.auth.reset()
  })

  it('should display a button to delete the batchSearch', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    wrapper = mount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    await wrapper.vm.$core.auth.getUsername()
    await flushPromises()
    expect(wrapper.find('.batch-search-actions__item--delete').exists()).toBeTruthy()
  })

  it('should display number of selected queries', async () => {
    const stateMock = { selectedQueries: [] }
    let storeMock = new Vuex.Store({
      modules: { batchSearch: { namespaced: true, state: stateMock, getters, mutations, actions: actionBuilder(api) } }
    })
    wrapper = mount(BatchSearchActions, { i18n, localVue, propsData, router, store: storeMock, wait })
    await flushPromises()

    expect(wrapper.find('.batch-search-actions__item__counter').exists()).toBeFalsy()

    const state2 = { selectedQueries: ['test'] }
    storeMock = new Vuex.Store({
      modules: { batchSearch: { namespaced: true, state: state2, getters, mutations, actions: actionBuilder(api) } }
    })
    wrapper = mount(BatchSearchActions, { i18n, localVue, propsData, router, store: storeMock, wait })
    await flushPromises()

    expect(wrapper.find('.batch-search-actions__item__counter').text()).toBe('1')
  })

  it('should NOT display a button to delete the batchSearch if it is not mine', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'other' }, JSON.stringify)
    wrapper = mount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    await wrapper.vm.$core.auth.getUsername()
    await flushPromises()
    expect(wrapper.find('.batch-search-actions__item--delete').exists()).toBeFalsy()
  })

  it('should display a button to download queries', () => {
    wrapper = shallowMount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    expect(wrapper.find('.batch-search-actions__item--download-queries').exists()).toBeTruthy()
  })

  it('should display a button to download results', async () => {
    wrapper = shallowMount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    await flushPromises()
    expect(wrapper.find('.batch-search-actions__item--download-results').exists()).toBeTruthy()
  })

  it('should NOT display a button to relaunch the BS if it is not mine', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'other' }, JSON.stringify)
    wrapper = shallowMount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    await flushPromises()
    expect(wrapper.find('.batch-search-actions__item--relaunch').exists()).toBeFalsy()
  })

  it('should display a button to relaunch the BS', async () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'test' }, JSON.stringify)
    wrapper = shallowMount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    await flushPromises()
    expect(wrapper.find('.batch-search-actions__item--relaunch').exists()).toBeTruthy()
  })

  it('should NOT display a button to relaunch the BS if BS status is failure', async () => {
    const propsData = {
      batchSearch: {
        uuid: '155',
        projects: [
          {
            name: 'BatchSearchActions'
          }
        ],
        description: 'This is the description of the batch search',
        state: 'QUEUED',
        date: '2019-07-18T14:45:34.869+0000',
        nbResults: 333,
        phraseMatch: 1,
        fuzziness: 1,
        fileTypes: [],
        paths: [],
        published: true,
        user: { id: 'test' }
      }
    }

    wrapper = shallowMount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    await flushPromises()
    expect(wrapper.find('.batch-search-actions__item--relaunch').exists()).toBeFalsy()
  })

  it('should redirect on batchSearch deletion', async () => {
    api.deleteBatchSearch = jest.fn()
    api.deleteBatchSearch.mockResolvedValue(true)
    jest.spyOn(router, 'push')
    wrapper = shallowMount(BatchSearchActions, { i18n, localVue, propsData, router, store, wait })
    await wrapper.vm.deleteBatchSearch()
    expect(router.push).toBeCalled()
    expect(router.push).toBeCalledWith({ name: 'batch-search' })
  })
})
