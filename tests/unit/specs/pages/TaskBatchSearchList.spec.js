import { mount } from '@vue/test-utils'
import { removeCookie, setCookie } from 'tiny-cookie'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import TaskBatchSearchList from '@/pages/TaskBatchSearchList'

describe('TaskBatchSearchList.vue', () => {
  const mockedBatchSearches = {
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
    pagination: { total: 2 }
  }

  let api, core, wrapper

  beforeEach(async () => {
    api = { getBatchSearches: vi.fn().mockResolvedValue(mockedBatchSearches) }
    core = CoreSetup.init(api).useAll().useRouter()
    setCookie(process.env.VITE_DS_COOKIE_NAME, { login: 'doe' }, JSON.stringify)
    core.config.merge({ mode: 'SERVER' })
    wrapper = mount(TaskBatchSearchList, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      }
    })
    await flushPromises()
  })

  afterAll(() => {
    removeCookie(process.env.VITE_DS_COOKIE_NAME)
  })

  it('should display a search bar', () => {
    expect(wrapper.find('.task-batch-search-list__search-bar').exists()).toBeTruthy()
  })

  it('should display a batch search table', () => {
    expect(wrapper.find('.batch-search-table').exists()).toBeTruthy()
  })

  it('should display a clear filters button', () => {
    const button = wrapper.find('.batch-search-clear-filters')
    expect(button.exists()).toBeTruthy()
    expect(button.attributes('disabled')).toBeDefined()
  })

  it("should display a 'No filtered result' message when no items and filter is on", async () => {
    const state = { batchSearches: [] }
    const getters = { hasBatchSearch: vi.fn().mockReturnValue(false) }
    const actions = { getBatchSearches: vi.fn() }
    const storeOptions = { modules: { batchSearch: { namespaced: true, state, getters, actions } } }
    const { plugins } = CoreSetup.init(api).useVuex(storeOptions)

    wrapper = mount(TaskBatchSearchList, { global: { plugins } })
    await flushPromises()
    expect(wrapper.find('.task-batch-search-list__none').exists()).toBeTruthy()
  })
})
