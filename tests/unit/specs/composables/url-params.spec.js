import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { flushPromises } from '@vue/test-utils'
import Vuex from 'vuex'

import {
  useUrlParam,
  useUrlParams,
  useUrlParamWithStore,
  useUrlParamsWithStore,
  replaceUrlParam
} from '@/composables/url-params'

vi.mock('lodash', async (importOriginal) => {
  const { default: actual } = await importOriginal()
  return {
    ...actual,
    debounce: (cb) => cb
  }
})

export function withSetup({ composable, store, routes = [], initialRoute = null }) {
  let result

  // Create a Vue Router instance with memory history for test environment
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      ...routes,
      {
        path: '/', // Add a default root route to match /
        component: {
          template: '<div>Default route</div>'
        }
      }
    ]
  })

  const app = createApp({
    setup() {
      result = composable()
      // Return a dummy render function
      return () => {}
    }
  })

  // Provide the Vuex store if it exists
  if (store) {
    app.use(store)
  }

  // Provide the Vue Router instance
  app.use(router)

  // Intialize the router with the initial route if any given
  if (initialRoute) {
    router.replace(initialRoute)
  }

  // Mount the app in a virtual DOM element
  app.mount(document.createElement('div'))

  return [result, router]
}

describe('useUrlParam', () => {
  it('should sync a single query parameter with the initial value', async () => {
    const [result, router] = withSetup({ composable: () => useUrlParam('q', 'default') })

    await router.push({ query: { q: 'test' } })
    await flushPromises()

    expect(result.value).toBe('test')
    expect(result.value).not.toBe('default')
  })

  it('should fallback to the initial value if query parameter is missing', async () => {
    const [result, router] = withSetup({ composable: () => useUrlParam('q', 'default') })

    await router.push({ query: {} })
    await flushPromises()

    expect(result.value).toBe('default')
  })

  it('should update the query parameter when the value changes', async () => {
    const [result, router] = withSetup({ composable: () => useUrlParam('q', 'default') })

    await router.push({ query: { q: 'default' } })
    await flushPromises()

    result.value = 'new value'
    await flushPromises()

    expect(router.currentRoute.value.query.q).toBe('new value')
  })
})

describe('useUrlParams', () => {
  it('should sync multiple query parameters with the initial values', async () => {
    const [result, router] = withSetup({
      composable: () => useUrlParams(['sort', 'order'], { initialValue: ['defaultSort', 'defaultOrder'] })
    })

    await router.push({ query: { sort: 'date', order: 'asc' } })
    await flushPromises()

    expect(result.value).toEqual(['date', 'asc'])
  })

  it('should fallback to the initial values if query parameters are missing', async () => {
    const [result, router] = withSetup({
      composable: () => useUrlParams(['sort', 'order'], { initialValue: ['defaultSort', 'defaultOrder'] })
    })

    await router.push({ query: {} })
    await flushPromises()

    expect(result.value).toEqual(['defaultSort', 'defaultOrder'])
  })

  it('should update the query parameters when the values change', async () => {
    const [result, router] = withSetup({
      composable: () => useUrlParams(['sort', 'order'], { initialValue: ['defaultSort', 'defaultOrder'] })
    })

    await router.push({ query: {} })
    await flushPromises()

    result.value = ['name', 'desc']
    await flushPromises()

    expect(router.currentRoute.value.query.sort).toBe('name')
    expect(router.currentRoute.value.query.order).toBe('desc')
  })
})

describe('useUrlParamWithStore', () => {
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        app: {
          sort: 'date'
        }
      },
      getters: {
        'app/getSort': (state) => state.app.sort
      },
      mutations: {
        'app/setSort': (state, value) => {
          state.app.sort = value
        }
      }
    })
  })

  it('should sync a single query parameter with Vuex store getter', async () => {
    const [result, router] = withSetup({
      store,
      composable: () => useUrlParamWithStore('sort', 'app/getSort', 'app/setSort')
    })

    await router.push({ query: { sort: 'name' } })
    await flushPromises()

    expect(result.value).toBe('name')
  })

  it('should fallback to Vuex store value if query parameter is missing', async () => {
    const [result, router] = withSetup({
      store,
      composable: () => useUrlParamWithStore('sort', 'app/getSort', 'app/setSort')
    })

    await router.push({ query: {} })
    await flushPromises()

    expect(result.value).toBe('date')
  })

  it('should update Vuex store when query parameter changes', async () => {
    const [result, router] = withSetup({
      store,
      composable: () => useUrlParamWithStore('sort', 'app/getSort', 'app/setSort')
    })

    await router.push({ query: {} })
    await flushPromises()

    result.value = 'price'
    await flushPromises()

    expect(store.state.app.sort).toBe('price')
  })

  it('should update query parameter when Vuex store value changes', async () => {
    const [, router] = withSetup({
      store,
      composable: () => useUrlParamWithStore('sort', 'app/getSort', 'app/setSort')
    })

    store.commit('app/setSort', 'creationDate')
    await flushPromises()

    expect(router.currentRoute.value.query.sort).toBe('creationDate')
  })
})

describe('useUrlParamsWithStore', () => {
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        app: {
          sort: 'date',
          order: 'asc'
        }
      },
      getters: {
        'app/getSortOrder': (state) => [state.app.sort, state.app.order]
      },
      mutations: {
        'app/setSortOrder': (state, { sort, order }) => {
          state.app.sort = sort
          state.app.order = order
        }
      }
    })
  })

  it('should sync multiple query parameters with Vuex store getter', async () => {
    const [result, router] = withSetup({
      store,
      composable: () => {
        return useUrlParamsWithStore(['sort', 'order'], {
          get: () => store.getters['app/getSortOrder'],
          set: (sort, order) => store.commit('app/setSortOrder', { sort, order })
        })
      }
    })

    await router.push({ query: { sort: 'name', order: 'desc' } })
    await flushPromises()

    expect(result.value).toEqual(['name', 'desc'])
  })

  it('should fallback to Vuex store values if query parameters are missing', async () => {
    const [result, router] = withSetup({
      store,
      composable: () => {
        return useUrlParamsWithStore(['sort', 'order'], {
          get: () => store.getters['app/getSortOrder'],
          set: (sort, order) => store.commit('app/setSortOrder', { sort, order })
        })
      }
    })

    await router.push({ query: {} })
    await flushPromises()

    expect(result.value).toEqual(['date', 'asc'])
  })

  it('should update Vuex store when query parameters change', async () => {
    const [result, router] = withSetup({
      store,
      composable: () => {
        return useUrlParamsWithStore(['sort', 'order'], {
          get: () => store.getters['app/getSortOrder'],
          set: (sort, order) => store.commit('app/setSortOrder', { sort, order })
        })
      }
    })

    await router.push({ query: {} })
    await flushPromises()

    result.value = ['name', 'desc']
    await flushPromises()

    expect(store.state.app.sort).toBe('name')
    expect(store.state.app.order).toBe('desc')
  })

  it('should update query parameters when Vuex store values change', async () => {
    const [, router] = withSetup({
      store,
      composable: () => {
        return useUrlParamsWithStore(['sort', 'order'], {
          get: () => store.getters['app/getSortOrder'],
          set: (sort, order) => store.commit('app/setSortOrder', { sort, order })
        })
      }
    })

    store.commit('app/setSortOrder', { sort: 'creationDate', order: 'desc' })
    await flushPromises()

    expect(router.currentRoute.value.query.sort).toBe('creationDate')
    expect(router.currentRoute.value.query.order).toBe('desc')
  })
})

describe('replaceUrlParam', () => {
  beforeEach(() => {
    // Reset the console warnings
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should do nothing if the "from" parameter does not exist', async () => {
    const [, router] = withSetup({
      initialRoute: { path: '/' },
      composable: () => replaceUrlParam({ from: 'oldParam', to: 'newParam' })
    })

    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({})
  })

  it('should replace "from" parameter with "to" when "to" is a string', async () => {
    const [, router] = withSetup({
      initialRoute: { path: '/', query: { oldParam: 'testValue' } },
      composable: () => replaceUrlParam({ from: 'oldParam', to: 'newParam' })
    })

    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ newParam: 'testValue' })
  })

  it('should transform the parameter when "to" is a function', async () => {
    const to = (value) => ({
      transformedParam: value.toUpperCase(),
    })

    const [, router] = withSetup({
      initialRoute: { path: '/', query: { oldParam: 'testValue' } },
      composable: () => replaceUrlParam({ from: 'oldParam', to })
    })

    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ transformedParam: 'TESTVALUE' })
  })

  it('should not change query if "to" function returns null', async () => {
    const to = (value) => null

    const [, router] = withSetup({
      initialRoute: { path: '/', query: { oldParam: 'testValue' } },
      composable: () => replaceUrlParam({ from: 'oldParam', to })
    })

    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ oldParam: 'testValue' })
  })

  it('should not do anythng if "to" is neither a string nor a function', async () => {
    const [, router] = withSetup({
      initialRoute: { path: '/', query: { oldParam: 'testValue' } },
      composable: () => replaceUrlParam({ from: 'oldParam', to: 42 })
    })

    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ oldParam: 'testValue' })
  })

  it('should handle multiple replacements', async () => {
    const [, router] = withSetup({
      initialRoute: { path: '/', query: { param1: 'value1', param2: 'value2' } },
      composable: () => {
        replaceUrlParam({ from: 'param1', to: 'newParam1' })
        replaceUrlParam({ from: 'param2', to: (value) => ({ newParam2: value + '_suffix' }) })
      }
    })

    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({
      newParam1: 'value1',
      newParam2: 'value2_suffix'
    })
  })

  it('should not cause infinite loops when replacing', async () => {
    const [, router] = withSetup({
      initialRoute: { path: '/', query: { size: '10' } },
      composable: () => {
        replaceUrlParam({ from: 'size', to: 'perPage' })
      }
    })

    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ perPage: '10' })

    // Simulate the route update that triggers the composable again
    // After the initial replacement, 'size' no longer exists, so no further action is taken
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ perPage: '10' })
  })
})

