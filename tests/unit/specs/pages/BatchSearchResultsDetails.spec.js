import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import { removeCookie } from 'tiny-cookie'
import VueRouter from 'vue-router'
import { flushPromises } from 'tests/unit/tests_utils'

import { Core } from '@/core'
import UserDisplay from '@/components/UserDisplay'
import BatchSearchResultsDetails from '@/components/BatchSearchResultsDetails'

describe('BatchSearchResultsDetails.vue', () => {
  let wrapper = null
  let i18n, localVue, store, wait, config, auth
  const router = new VueRouter({
    routes: [
      {
        name: 'batch-search.results',
        path: 'batch-search/:indices/:uuid'
      }
    ]
  })
  const batchSearch = {
    uuid: '12',
    projects: [{ name: 'batchsearchresults' }, { name: 'anotherbatchsearchresults' }],
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
    queries: {
      query_01: 6,
      query_02: 6,
      query_03: 6
    },
    user: {
      id: 'test'
    }
  }
  const propsData = { batchSearch }

  beforeEach(async () => {
    Murmur.config.merge({ mode: 'SERVER' })
    const api = jest.fn()

    const core = Core.init(createLocalVue(), api).useAll()
    i18n = core.i18n
    localVue = core.localVue
    store = core.store
    wait = core.wait
    config = core.config
    core.auth.getUsername = jest.fn().mockResolvedValue('test')
    auth = core.auth
    wrapper = shallowMount(BatchSearchResultsDetails, { i18n, localVue, propsData, router, store, wait })
  })
  afterEach(() => {
    store.commit('batchSearch/reset')
    removeCookie(process.env.VUE_APP_DS_COOKIE_NAME)
  })
  it('should display the details of a batch search', () => {
    expect(wrapper.find('.batch-search-results-details').exists()).toBeTruthy()
  })
  it('should display the title and the actions buttons of a batch search in the header', () => {
    expect(wrapper.find('.batch-search-results-details .card-body').text()).toBe('BatchSearch Test')
    expect(wrapper.find('.batch-search-results-details batch-search-actions-stub').exists()).toBe(true)
  })

  it('should show a description if there is one', async () => {
    expect(wrapper.find('.batch-search-results-details__info__description').text()).toBe(
      'This is the description of the batch search'
    )
    await wrapper.setProps({ batchSearch: { ...batchSearch, description: null } })
    expect(wrapper.find('.batch-search-results-details__info__description').exists()).toBe(false)
  })

  it('should display 8 info about my BatchSearch', () => {
    expect(wrapper.find('.batch-search-results-details__info').exists()).toBeTruthy()
    expect(wrapper.findAll('.batch-search-results-details__info dd')).toHaveLength(8)
  })

  it('should display the author of the  (me)', async () => {
    expect(wrapper.findComponent(UserDisplay).attributes('username')).toBe('test')
    expect(wrapper.vm.isMyBatchSearch).toBe(true)
  })

  it('should show published status when the batch search is mine', async () => {
    expect(wrapper.find('.batch-search-results-details__info__published').exists()).toBe(true)
    await wrapper.setData({ isMyBatchSearch: false })
    expect(wrapper.find('.batch-search-results-details__info__published').exists()).toBe(false)
  })
  it('should emit event to update published status on checkbox check', async () => {
    const wrapper2 = mount(BatchSearchResultsDetails, { auth, config, i18n, localVue, propsData, router, store, wait })
    await flushPromises()
    const checkbox = wrapper2.find('.batch-search-results-details__info__published .custom-control-input')
    await checkbox.setChecked(false)
    expect(wrapper2.emitted()['update:published']).toEqual([[false]])
  })

  describe('Projects column', () => {
    it('should contain all the projects in which the batch search is performed', () => {
      const projectLinks = wrapper.findAll('.batch-search-results-details__info__project-link')
      expect(projectLinks).toHaveLength(2)
    })

    it('should display project names as clickable links', () => {
      const projectLinks = wrapper.findAll('.batch-search-results-details__info__project-link')
      expect(projectLinks.at(0).element.tagName).toBe('ROUTER-LINK-STUB')
      expect(projectLinks.at(1).element.tagName).toBe('ROUTER-LINK-STUB')
    })
  })
})
