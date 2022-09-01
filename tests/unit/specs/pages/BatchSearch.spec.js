import Murmur from '@icij/murmur'
import { createLocalVue, mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'
import VueRouter from 'vue-router'

import { flushPromises } from 'tests/unit/tests_utils'
import { Core } from '@/core'
import BatchSearch from '@/pages/BatchSearch'
import Vuex from 'vuex'

jest.mock('@/api', () => {
  return jest.fn(() => {
    return {
      getBatchSearches: jest.fn().mockReturnValue(Promise.resolve({
        items: [{
          uuid: '1',
          projects: [{ name: 'project_01' }, { name: 'project_02' }],
          name: 'name_01',
          description: 'description_01',
          date: '2019-01-01',
          nbResults: 2,
          nbQueries: 1,
          state: 'SUCCESS'
        }, {
          uuid: '2',
          projects: [{ name: 'project_02' }],
          name: 'name_02',
          description: 'description_02',
          date: '2019-01-01',
          nbResults: 3,
          nbQueries: 2,
          state: 'FAILURE'
        }],
        total: 2
      }))
    }
  })
})

describe('BatchSearch.vue', () => {
  const { i18n, localVue, store, wait } = Core.init(createLocalVue()).useAll()
  let wrapper = null
  const router = new VueRouter()

  beforeAll(() => setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify))

  afterAll(() => {
    jest.unmock('@/api')
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
  })

  beforeEach(async () => {
    wrapper = mount(BatchSearch, { i18n, localVue, router, store, wait })
    await flushPromises()
  })
  beforeAll(async () => {
    Murmur.config.merge({ mode: 'SERVER' })
    await flushPromises()
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

  it('should display a \'No filtered result\' message when no items and filter is on', async () => {
    const state = { batchSearches: [] }
    const actions = { hasBatchSearch: jest.fn() }
    const store = new Vuex.Store({ modules: { batchSearch: { namespaced: true, state, actions } } })

    wrapper = mount(BatchSearch, { i18n, localVue, router, store, wait })
    await flushPromises()

    expect(wrapper.find('.batch-search__none').exists()).toBeTruthy()
  })
})
