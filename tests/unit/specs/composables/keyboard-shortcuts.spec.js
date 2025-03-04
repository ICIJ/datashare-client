import { createMemoryHistory, createRouter } from 'vue-router'
import { createApp } from 'vue'

import allShortcuts from '@/utils/keyboard-shortcuts.json'
import { useKeyboardShortcuts } from '@/composables/keyboard-shortcuts'
import CoreSetup from '~tests/unit/CoreSetup'

describe('useKeyboardShortcuts', () => {
  function withSetup({ composable }) {
    let result
    // A simplified version of the routes to avoid unecessary complexity
    const routes = [{ name: 'landing' }, { name: 'search' }]
    // Create a Vue Router instance with memory history for test environment
    const router = createRouter({ history: createMemoryHistory(), routes })

    const app = createApp({
      setup() {
        result = composable()
        // Return a dummy render function
        return () => { }
      }
    })

    app.use(router)
    // Mount the app in a virtual DOM element
    app.mount(document.createElement('div'))

    return { result, router }
  }

  it('should get no route shortcuts for the initial route', () => {
    const { result } = withSetup({ composable: useKeyboardShortcuts })
    const { routeShortcuts } = result
    expect(routeShortcuts.value).toHaveLength(0)
  })

  it('should get all the shortcuts with a ref', () => {
    const { result } = withSetup({ composable: useKeyboardShortcuts })
    const { shortcuts } = result
    expect(shortcuts.value).toHaveLength(allShortcuts.length)
  })

  it('should get the route shortcuts for `search`route reactivly', async () => {
    const { result, router } = withSetup({ composable: useKeyboardShortcuts })
    const { routeShortcuts } = result
    await router.push({ name: 'search' })
    expect(routeShortcuts.value).not.toHaveLength(0)
  })
})
