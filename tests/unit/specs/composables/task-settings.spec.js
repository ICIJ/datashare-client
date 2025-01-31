import { createMemoryHistory, createRouter } from 'vue-router'
import { createApp } from 'vue'

import { useTaskSettings } from '@/composables/task-settings'
import CoreSetup from '~tests/unit/CoreSetup'

describe('useTaskSettings', () => {
  function withSetup({ composable, store, i18n, routes = [] }) {
    let result
    // Create a Vue Router instance with memory history for test environment
    const router = createRouter({ history: createMemoryHistory(), routes })

    const app = createApp({
      setup() {
        result = composable()
        // Return a dummy render function
        return () => {}
      }
    })

    app.use(store)
    app.use(router)
    app.use(i18n)
    // Mount the app in a virtual DOM element
    app.mount(document.createElement('div'))

    return result
  }

  it('should initialize "app/task" settings with sort by to name / desc', () => {
    const { store, router, i18n } = CoreSetup.init().useAll().useRouter()
    const { sortBy } = withSetup({ store, router, i18n, composable: () => useTaskSettings('task') })
    expect(sortBy.value.modelValue).toEqual(['name', 'desc'])
  })

  it('should initialize "app/entities" task settings per page is 10', () => {
    const { store, router, i18n } = CoreSetup.init().useAll().useRouter()
    const { perPage } = withSetup({ store, router, i18n, composable: () => useTaskSettings('entities') })
    expect(perPage.value.modelValue).toEqual(10)
  })

  it('should initialize "app/batch-download" task settings propertiesModelValueOptions contains correct properties', () => {
    const { store, router, i18n } = CoreSetup.init().useAll().useRouter()
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
        //  expect.objectContaining({ value: 'docs' }),
        expect.objectContaining({ value: 'createdAt' }),
        expect.objectContaining({ value: 'state' })
      ])
    )
  })
})
