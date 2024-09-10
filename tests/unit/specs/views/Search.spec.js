import cloneDeep from 'lodash/cloneDeep'
import { shallowMount } from '@vue/test-utils'
import { errors as esErrors } from 'elasticsearch-browser'

import { flushPromises } from '~tests/unit/tests_utils'
import CoreSetup from '~tests/unit/CoreSetup'
import Search from '@/views/Search'
import { state, getters, mutations } from '@/store/modules/search'

describe('Search.vue', () => {
  let actionsStore, core, wrapper

  beforeEach(() => {
    actionsStore = { query: vi.fn(), refresh: vi.fn(), updateFromRouteQuery: vi.fn() }
    core = CoreSetup.init()
      .useCore()
      .useI18n()
      .useRouter()
      .useVuex({
        modules: {
          search: {
            namespaced: true,
            state: cloneDeep(state),
            getters: cloneDeep(getters),
            mutations: cloneDeep(mutations),
            actions: actionsStore
          },
          document: {
            namespaced: true
          }
        }
      })
    wrapper = shallowMount(Search, {
      global: {
        plugins: core.plugins,
        renderStubDefaultSlot: true
      }
    })
  })

  it('should search query on component creation', async () => {
    expect(actionsStore.query).toBeCalledTimes(1)
  })

  it('should refresh the view on custom event', async () => {
    actionsStore.query.mockClear()
    core.emit('index::delete::all')

    expect(actionsStore.query).toBeCalledTimes(1)
  })

  it('should execute a new search on event "filter::starred::refresh"', () => {
    core.emit('filter::starred::refresh')

    expect(actionsStore.refresh).toBeCalledTimes(1)
  })

  it('should redirect to the complete query', async () => {
    const query = 'this is a query'
    core.store.commit('search/query', query)
    await flushPromises()
    const backdrop = wrapper.findComponent('.search__body__backdrop')
    expect(backdrop.props('to')).toMatchObject({ name: 'search', query: { q: query } })
  })

  describe('refresh button on request timeout', () => {
    it('should return true for isRequestTimeoutError if error is RequestTimeout', () => {
      core.store.commit('search/error', new esErrors.RequestTimeout())
      expect(wrapper.vm.isRequestTimeoutError).toBeTruthy()
    })

    it('should return false for isRequestTimeoutError if error is NOT RequestTimeout', () => {
      core.store.commit('search/error', new esErrors.NoConnections())
      expect(wrapper.vm.isRequestTimeoutError).toBeFalsy()
    })

    it('should display a button to try again if error is RequestTimeout', async () => {
      core.store.commit('search/error', new esErrors.RequestTimeout())
      await flushPromises()
      expect(wrapper.find('b-button-stub').exists()).toBeTruthy()
    })
  })
})
