import { shallowMount, mount } from '@vue/test-utils'
import { removeCookie } from 'tiny-cookie'

import CoreSetup from '~tests/unit/CoreSetup'
import { flushPromises } from '~tests/unit/tests_utils'
import UserDisplay from '@/components/UserDisplay'
import BatchSearchResultsDetails from '@/components/BatchSearchResultsDetails'

describe('BatchSearchResultsDetails.vue', () => {
  const batchSearch = {
    uuid: '12',
    projects: ['projectA', 'projectB'],
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

  describe('shallow mounted', () => {
    let wrapper = null
    let plugins, store

    beforeEach(async () => {
      const api = vi.fn()
      const props = { batchSearch }
      const core = CoreSetup.init(api).useAll().useRouter()
      core.config.merge({ mode: 'SERVER' })
      core.auth.getUsername = vi.fn().mockResolvedValue('test')
      plugins = core.plugins
      store = core.store
      wrapper = shallowMount(BatchSearchResultsDetails, { props, global: { plugins } })
    })

    afterEach(() => {
      store.commit('batchSearch/reset')
      removeCookie(process.env.VITE_DS_COOKIE_NAME)
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

    describe('Projects column', () => {
      it('should contain all the projects in which the batch search is performed', () => {
        const projectLinks = wrapper.findAll('.batch-search-results-details__info__projects__link')
        expect(projectLinks).toHaveLength(2)
      })

      it('should display project names as clickable links', () => {
        const projects = wrapper.find('.batch-search-results-details__info__projects')
        const projectLinks = projects.findAllComponents({ name: 'ProjectLink' })
        expect(projectLinks).toHaveLength(2)
        expect(projectLinks.at(0).attributes('project')).toBe('projectA')
        expect(projectLinks.at(1).attributes('project')).toBe('projectB')
      })
    })
  })

  describe('mounted', () => {
    let wrapper = null
    let plugins

    beforeEach(async () => {
      const api = vi.fn()
      const props = { batchSearch }
      const core = CoreSetup.init(api).useAll().useRouter()
      core.config.merge({ mode: 'SERVER' })
      core.auth.getUsername = vi.fn().mockResolvedValue('test')
      plugins = core.plugins
      wrapper = mount(BatchSearchResultsDetails, { props, global: { plugins } })
      await flushPromises()
    })

    it('should emit event to update published status on checkbox check', async () => {
      const checkbox = wrapper.find('.batch-search-results-details__info__published .form-check-input')
      await checkbox.setChecked(false)
      expect(wrapper.emitted('update:published')).toBeTruthy()
    })
  })
})
