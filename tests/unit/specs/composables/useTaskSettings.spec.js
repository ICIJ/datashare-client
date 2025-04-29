import { createMemoryHistory, createRouter } from 'vue-router'
import { createApp } from 'vue'

import { useTaskSettings } from '@/composables/useTaskSettings'
import CoreSetup from '~tests/unit/CoreSetup'

vi.mock('@/composables/useCore', () => ({
  useCore: vi.fn(() => ({
    core: {
      mode: { modeName: 'SERVER' }
    }
  }))
}))

describe('useTaskSettings', () => {
  function withSetup({ composable, store, i18n, routes = [] }) {
    let result
    // Create a Vue Router instance with memory history for test environment
    const router = createRouter({ history: createMemoryHistory(), routes })

    const app = createApp({
      setup() {
        result = composable()
      }
    })
    app.use(store)
    app.use(router)
    app.use(i18n)
    // Mount the app in a virtual DOM element
    app.mount(document.createElement('div'))

    return result
  }

  afterAll(() => {
    vi.resetAllMocks()
  })

  it('should initialize "app/task" settings with sort by to createdAt / desc', () => {
    const { store, router, i18n } = CoreSetup.init().useAll().useRouterWithoutGuards()
    const { sortBy } = withSetup({ store, router, i18n, composable: () => useTaskSettings('task') })
    expect(sortBy.value.modelValue).toEqual(['createdAt', 'desc'])
  })

  it('should initialize "app/entities" task settings per page is 10', () => {
    const { store, router, i18n } = CoreSetup.init().useAll().useRouterWithoutGuards()
    const { perPage } = withSetup({ store, router, i18n, composable: () => useTaskSettings('entities') })
    expect(perPage.value.modelValue).toEqual('10')
  })

  it('should initialize "app/batch-download" task settings propertiesModelValueOptions contains correct properties', () => {
    const { store, router, i18n } = CoreSetup.init().useAll().useRouterWithoutGuards()
    const { propertiesModelValueOptions } = withSetup({
      store,
      router,
      i18n,
      composable: () => useTaskSettings('batch-download')
    })

    expect(propertiesModelValueOptions.value).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'name' }),
        expect.objectContaining({ value: 'size' }),
        expect.objectContaining({ value: 'createdAt' }),
        expect.objectContaining({ value: 'state' })
      ])
    )
  })
})
