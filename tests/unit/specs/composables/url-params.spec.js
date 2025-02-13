import { createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'

import { useAppStore } from '@/store/modules/app'
import {
  whenIsRoute,
  whenDifferentRoute,
  useUrlParam,
  useUrlParams,
  useUrlPageFrom,
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

export function withSetup({ composable, routes = [], initialRoute = null }) {
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

  const pinia = createPinia()
  // Setup Pinia
  app.use(pinia)

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

describe('useUrlPageFrom', () => {
  const perPage = 100

  it('should update the page to 2', async () => {
    const [result, router] = withSetup({ composable: () => useUrlPageFrom({ perPage }) })
    await router.push({ query: { from: 100 } })
    expect(result.value).toBe(2)
  })

  it('should update the page to 2, even with a string parameter', async () => {
    const [result, router] = withSetup({ composable: () => useUrlPageFrom({ perPage }) })
    await router.push({ query: { from: '100' } })
    expect(result.value).toBe(2)
  })

  it('should update the page to 11', async () => {
    const [result, router] = withSetup({ composable: () => useUrlPageFrom({ perPage }) })
    await router.push({ query: { from: '1000' } })
    expect(result.value).toBe(11)
  })

  it('should update the from parameter to 100', async () => {
    const [result, router] = withSetup({ composable: () => useUrlPageFrom({ perPage }) })

    result.value = 2
    await flushPromises()

    expect(router.currentRoute.value.query.from).toBe('100')
  })

  it('should update the from parameter to 1900', async () => {
    const [result, router] = withSetup({ composable: () => useUrlPageFrom({ perPage }) })

    result.value = 20
    await flushPromises()

    expect(router.currentRoute.value.query.from).toBe('1900')
  })
})

describe('useUrlParamWithStore', () => {
  let composable

  beforeEach(() => {
    composable = () => {
      const appStore = useAppStore()

      return useUrlParamWithStore('perPage', {
        get: () => appStore.getSettings('search', 'perPage'),
        set: (perPage) => appStore.setSettings({ view: 'search', perPage })
      })
    }
  })

  it('should sync a single query parameter with the store', async () => {
    const [result, router] = withSetup({ composable })

    await router.push({ query: { perPage: '34' } })
    await flushPromises()

    expect(result.value).toBe('34')
  })

  it('should fallback to store value if query parameter is missing', async () => {
    const [result, router] = withSetup({ composable })

    await router.push({ query: {} })
    await flushPromises()

    expect(result.value).toBe('25')
  })

  it('should update store when query parameter changes', async () => {
    const [result, router] = withSetup({ composable })
    const appStore = useAppStore()

    await router.push({ query: {} })
    await flushPromises()

    result.value = '11'
    await flushPromises()

    expect(appStore.getSettings('search', 'perPage')).toBe('11')
  })

  it('should update query parameter when store value changes', async () => {
    const [, router] = withSetup({ composable })
    const appStore = useAppStore()

    appStore.setSettings({ view: 'search', perPage: '66' })
    await flushPromises()

    expect(router.currentRoute.value.query.perPage).toBe('66')
  })
})

describe('useUrlParamsWithStore', () => {
  let composable

  beforeEach(() => {
    composable = () => {
      const appStore = useAppStore()

      return useUrlParamsWithStore(['sort', 'order'], {
        get: () => appStore.getSettings('search', 'orderBy'),
        set: (sort, order) => appStore.setSettings({ view: 'search', orderBy: [sort, order] })
      })
    }
  })

  it('should sync multiple query parameters with store getter', async () => {
    const [result, router] = withSetup({ composable })

    await router.push({ query: { sort: 'name', order: 'desc' } })
    await flushPromises()

    expect(result.value).toEqual(['name', 'desc'])
  })

  it('should fallback to store values if query parameters are missing', async () => {
    const [result, router] = withSetup({ composable })

    await router.push({ query: {} })
    await flushPromises()

    expect(result.value).toEqual(['_score', 'desc'])
  })

  it('should update store when query parameters change', async () => {
    const [result, router] = withSetup({ composable })
    const appStore = useAppStore()

    await router.push({ query: {} })
    await flushPromises()

    result.value = ['name', 'desc']
    await flushPromises()

    expect(appStore.settings.views.search.orderBy).toEqual(['name', 'desc'])
  })

  it('should update query parameters when store values change', async () => {
    const [, router] = withSetup({ composable })

    const appStore = useAppStore()
    appStore.settings.views.search.orderBy = ['creationDate', 'desc']

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
      transformedParam: value.toUpperCase()
    })

    const [, router] = withSetup({
      initialRoute: { path: '/', query: { oldParam: 'testValue' } },
      composable: () => replaceUrlParam({ from: 'oldParam', to })
    })

    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ transformedParam: 'TESTVALUE' })
  })

  it('should not change query if "to" function returns null', async () => {
    const to = () => null

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

describe('whenIsRoute', () => {
  let router

  beforeEach(() => {
    router = null
  })

  it('should call the callback when the route name matches', async () => {
    const callback = vi.fn()
    const composable = () => whenIsRoute('test-route', callback)

    const routes = [{ path: '/', name: 'test-route', component: { template: '<div>Home</div>' } }]
    const initialRoute = { name: 'test-route', path: '/' }

    const [fn, testRouter] = withSetup({ composable, routes, initialRoute })
    router = testRouter

    await router.isReady()
    await flushPromises()

    fn()

    expect(callback).toHaveBeenCalled()
  })

  it('should not call the callback when the route name does not match', async () => {
    const callback = vi.fn()
    const composable = () => whenIsRoute('other-route', callback)

    const routes = [{ path: '/', name: 'test-route', component: { template: '<div>Home</div>' } }]
    const initialRoute = { name: 'test-route', path: '/' }

    const [fn, testRouter] = withSetup({ composable, routes, initialRoute })
    router = testRouter

    await router.isReady()
    await flushPromises()

    fn()

    expect(callback).not.toHaveBeenCalled()
  })

  it('should always call the callback when no name is provided', async () => {
    const callback = vi.fn()
    const composable = () => whenIsRoute(null, callback)

    const routes = [{ path: '/', name: 'test-route', component: { template: '<div>Home</div>' } }]
    const initialRoute = { name: 'test-route', path: '/' }

    const [fn, testRouter] = withSetup({ composable, routes, initialRoute })
    router = testRouter

    await router.isReady()
    await flushPromises()

    fn()

    expect(callback).toHaveBeenCalled()
  })
})

describe('whenDifferentRoute', () => {
  let router

  beforeEach(() => {
    router = null
  })

  it('should call the callback when the route name does not match', async () => {
    const callback = vi.fn()
    const composable = () => whenDifferentRoute('other-route', callback)

    const routes = [{ path: '/', name: 'test-route', component: { template: '<div>Home</div>' } }]
    const initialRoute = { name: 'test-route', path: '/' }

    const [fn, testRouter] = withSetup({ composable, routes, initialRoute })
    router = testRouter

    await router.isReady()
    await flushPromises()

    fn()

    expect(callback).toHaveBeenCalled()
  })

  it('should not call the callback when the route name matches', async () => {
    const callback = vi.fn()
    const composable = () => whenDifferentRoute('test-route', callback)

    const routes = [{ path: '/', name: 'test-route', component: { template: '<div>Home</div>' } }]
    const initialRoute = { name: 'test-route', path: '/' }

    const [fn, testRouter] = withSetup({ composable, routes, initialRoute })
    router = testRouter

    await router.isReady()
    await flushPromises()

    fn()

    expect(callback).not.toHaveBeenCalled()
  })

  it('should not call the callback when no name is provided', async () => {
    const callback = vi.fn()
    const composable = () => whenDifferentRoute(null, callback)

    const routes = [{ path: '/', name: 'test-route', component: { template: '<div>Home</div>' } }]
    const initialRoute = { name: 'test-route', path: '/' }

    const [fn, testRouter] = withSetup({ composable, routes, initialRoute })
    router = testRouter

    await router.isReady()
    await flushPromises()

    fn()

    expect(callback).not.toHaveBeenCalled()
  })
})
