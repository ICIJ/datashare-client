import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'
import VueRouter from 'vue-router'
import { flushPromises } from 'tests/unit/tests_utils'
import Vuex from 'vuex'

import { Core } from '@/core'
import BatchSearch from '@/pages/BatchSearch'
import { Api } from '@/api'

describe('BatchSearch.vue', () => {
  let i18n, localVue, store, wait, api
  let wrapper = null
  const router = new VueRouter()
  beforeAll(async () => {
    api = new Api(null, null)
    api.getBatchSearches = jest.fn().mockResolvedValue({
      items: [
        {
          uuid: '1',
          projects: [{ name: 'project_01' }, { name: 'project_02' }],
          name: 'name_01',
          description: 'description_01',
          date: '2019-01-01',
          nbResults: 2,
          nbQueries: 1,
          state: 'SUCCESS'
        },
        {
          uuid: '2',
          projects: [{ name: 'project_02' }],
          name: 'name_02',
          description: 'description_02',
          date: '2019-01-01',
          nbResults: 3,
          nbQueries: 2,
          state: 'FAILURE'
        }
      ],
      total: 2
    })
    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait

    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
    Murmur.config.merge({ mode: 'SERVER' })
    await flushPromises()
  })
  beforeEach(async () => {
    wrapper = mount(BatchSearch, { i18n, localVue, router, store, wait })
    await flushPromises()
  })

  afterAll(() => {
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
  })

  it('should display a search bar', () => {
    expect(wrapper.find('.batch-search__search-bar').exists()).toBeTruthy()
  })

  it('should display a batch search table', () => {
    expect(wrapper.find('.batch-search-table').exists()).toBeTruthy()
  })

  it('should display a clear filters button', () => {
    const button = wrapper.find('.batch-search-clear-filters')
    expect(button.exists()).toBeTruthy()
    expect(button.attributes().disabled).toBeTruthy()
  })

  it("should display a 'No filtered result' message when no items and filter is on", async () => {
    const state = { batchSearches: [] }
    const getters = { hasBatchSearch: jest.fn().mockReturnValue(false) }
    const actions = { getBatchSearches: jest.fn() }
    const store = new Vuex.Store({ modules: { batchSearch: { namespaced: true, state, getters, actions } } })

    wrapper = mount(BatchSearch, { i18n, localVue, router, store, wait })
    await flushPromises()

    expect(wrapper.find('.batch-search__none').exists()).toBeTruthy()
  })
})
