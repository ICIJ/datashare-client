import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { flushPromises } from '@vue/test-utils'
import Vuex from 'vuex'

import { useUrlParam, useUrlParams, useUrlParamWithStore, useUrlParamsWithStore } from '@/composables/url-params'

vi.mock('lodash', async (importOriginal) => {
  const { default: actual } = await importOriginal()
  return {
    ...actual,
    debounce: (cb) => cb
  }
})

export function withSetup(composable, store, routes = []) {
  let result

  // Create a Vue Router instance with memory history for test environment
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      ...routes,
      {
        path: '/', // Add a default root route to match '/'
        component: { template: '<div>Default route</div>' }
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

  // Mount the app in a virtual DOM element
  app.mount(document.createElement('div'))

  return [result, router]
}

describe('useUrlParam', () => {
  it('should sync a single query parameter with the initial value', async () => {
    const [result, router] = withSetup(() => useUrlParam('q', 'default'))

    await router.push({ query: { q: 'test' } })
    await flushPromises()

    expect(result.value).toBe('test')
    expect(result.value).not.toBe('default')
  })

  it('should fallback to the initial value if query parameter is missing', async () => {
    const [result, router] = withSetup(() => useUrlParam('q', 'default'))

    await router.push({ query: {} })
    await flushPromises()

    expect(result.value).toBe('default')
  })

  it('should update the query parameter when the value changes', async () => {
    const [result, router] = withSetup(() => useUrlParam('q', 'default'))

    await router.push({ query: { q: 'default' } })
    await flushPromises()

    result.value = 'new value'
    await flushPromises()

    expect(router.currentRoute.value.query.q).toBe('new value')
  })
})

describe('useUrlParams', () => {
  it('should sync multiple query parameters with the initial values', async () => {
    const [result, router] = withSetup(() =>
      useUrlParams(['sort', 'order'], { initialValue: ['defaultSort', 'defaultOrder'] })
    )

    await router.push({ query: { sort: 'date', order: 'asc' } })
    await flushPromises()

    expect(result.value).toEqual(['date', 'asc'])
  })

  it('should fallback to the initial values if query parameters are missing', async () => {
    const [result, router] = withSetup(() =>
      useUrlParams(['sort', 'order'], { initialValue: ['defaultSort', 'defaultOrder'] })
    )

    await router.push({ query: {} })
    await flushPromises()

    expect(result.value).toEqual(['defaultSort', 'defaultOrder'])
  })

  it('should update the query parameters when the values change', async () => {
    const [result, router] = withSetup(() =>
      useUrlParams(['sort', 'order'], { initialValue: ['defaultSort', 'defaultOrder'] })
    )

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
    const [result, router] = withSetup(() => useUrlParamWithStore('sort', 'app/getSort', 'app/setSort'), store)

    await router.push({ query: { sort: 'name' } })
    await flushPromises()

    expect(result.value).toBe('name')
  })

  it('should fallback to Vuex store value if query parameter is missing', async () => {
    const [result, router] = withSetup(() => useUrlParamWithStore('sort', 'app/getSort', 'app/setSort'), store)

    await router.push({ query: {} })
    await flushPromises()

    expect(result.value).toBe('date')
  })

  it('should update Vuex store when query parameter changes', async () => {
    const [result, router] = withSetup(() => useUrlParamWithStore('sort', 'app/getSort', 'app/setSort'), store)

    await router.push({ query: {} })
    await flushPromises()

    result.value = 'price'
    await flushPromises()

    expect(store.state.app.sort).toBe('price')
  })

  it('should update query parameter when Vuex store value changes', async () => {
    const [, router] = withSetup(() => useUrlParamWithStore('sort', 'app/getSort', 'app/setSort'), store)

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
    const [result, router] = withSetup(
      () =>
        useUrlParamsWithStore(['sort', 'order'], {
          get: () => store.getters['app/getSortOrder'],
          set: (sort, order) => store.commit('app/setSortOrder', { sort, order })
        }),
      store
    )

    await router.push({ query: { sort: 'name', order: 'desc' } })
    await flushPromises()

    expect(result.value).toEqual(['name', 'desc'])
  })

  it('should fallback to Vuex store values if query parameters are missing', async () => {
    const [result, router] = withSetup(
      () =>
        useUrlParamsWithStore(['sort', 'order'], {
          get: () => store.getters['app/getSortOrder'],
          set: (sort, order) => store.commit('app/setSortOrder', { sort, order })
        }),
      store
    )

    await router.push({ query: {} })
    await flushPromises()

    expect(result.value).toEqual(['date', 'asc'])
  })

  it('should update Vuex store when query parameters change', async () => {
    const [result, router] = withSetup(
      () =>
        useUrlParamsWithStore(['sort', 'order'], {
          get: () => store.getters['app/getSortOrder'],
          set: (sort, order) => store.commit('app/setSortOrder', { sort, order })
        }),
      store
    )

    await router.push({ query: {} })
    await flushPromises()

    result.value = ['name', 'desc']
    await flushPromises()

    expect(store.state.app.sort).toBe('name')
    expect(store.state.app.order).toBe('desc')
  })

  it('should update query parameters when Vuex store values change', async () => {
    const [, router] = withSetup(
      () =>
        useUrlParamsWithStore(['sort', 'order'], {
          get: () => store.getters['app/getSortOrder'],
          set: (sort, order) => store.commit('app/setSortOrder', { sort, order })
        }),
      store
    )

    store.commit('app/setSortOrder', { sort: 'creationDate', order: 'desc' })
    await flushPromises()

    expect(router.currentRoute.value.query.sort).toBe('creationDate')
    expect(router.currentRoute.value.query.order).toBe('desc')
  })
})
