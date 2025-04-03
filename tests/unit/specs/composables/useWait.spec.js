import { getCurrentInstance, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

import { useWait } from '@/composables/useWait'
import { useWaitStore } from '@/store/modules/wait'

describe('useWait composable', () => {
  // Install Pinia for each test
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('computes isLoading correctly and waiting returns the proper state', async () => {
    const TestComponent = {
      setup() {
        // Use non-scoped mode (default)
        const { isLoading, waiting, loaderId } = useWait()
        return { isLoading, waiting, loaderId }
      },
      template: '<div></div>'
    }

    const wrapper = mount(TestComponent)
    const waitStore = useWaitStore()

    // Initially, no loader is set in the global scope (null -> '__global__')
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.waiting(wrapper.vm.loaderId)).toBe(false)

    // Directly set the loader to true in the store
    // For non-scoped usage, the store uses GLOBAL_SCOPE_KEY = "__global__"
    waitStore.set(null, wrapper.vm.loaderId, true)
    await nextTick()
    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.vm.waiting(wrapper.vm.loaderId)).toBe(true)

    // Now set the loader to false
    waitStore.set(null, wrapper.vm.loaderId, false)
    await nextTick()
    expect(wrapper.vm.isLoading).toBe(false)
    expect(wrapper.vm.waiting(wrapper.vm.loaderId)).toBe(false)
  })

  it('sets loader to true when start is called and to false when end is called', async () => {
    const TestComponent = {
      setup() {
        const { start, end, waiting, loaderId } = useWait()
        return { start, end, waiting, loaderId }
      },
      template: '<div></div>'
    }

    const wrapper = mount(TestComponent)
    const waitStore = useWaitStore()

    // Before calling start, there is no loader in the global scope
    expect(waitStore.loaders.__global__).toBeUndefined()

    // Call start with a custom id
    wrapper.vm.start('loader1')
    await nextTick()
    expect(waitStore.loaders.__global__).toBeDefined()
    expect(waitStore.loaders.__global__.loader1).toBe(true)
    expect(wrapper.vm.waiting('loader1')).toBe(true)

    // Call end to turn the loader off
    wrapper.vm.end('loader1')
    await nextTick()
    expect(waitStore.loaders.__global__.loader1).toBe(false)
    expect(wrapper.vm.waiting('loader1')).toBe(false)
  })

  it('wraps an async function with waitFor, toggling loader state appropriately', async () => {
    const TestComponent = {
      setup() {
        // Using non-scoped mode
        const { waitFor, loaderId } = useWait()
        // An async function to wrap
        const asyncFn = async (val) => {
          return `result-${val}`
        }
        // Wrap the function using the default loader id provided by the composable
        const wrappedFn = waitFor(asyncFn)
        return { wrappedFn, loaderId }
      },
      template: '<div></div>'
    }

    const wrapper = mount(TestComponent)
    const waitStore = useWaitStore()

    // Initially, there is no loader under the global scope
    expect(waitStore.loaders.__global__).toBeUndefined()

    // Call the wrapped function and immediately check that the loader is set to true
    const resultPromise = wrapper.vm.wrappedFn('A')
    expect(waitStore.loaders.__global__[wrapper.vm.loaderId]).toBe(true)
    const result = await resultPromise
    await nextTick()
    // After the promise resolves, the loader should be false
    expect(waitStore.loaders.__global__[wrapper.vm.loaderId]).toBe(false)
    expect(result).toBe('result-A')
  })

  it('uses a custom loader id when waitFor is called with a string id', async () => {
    const TestComponent = {
      setup() {
        const { waitFor } = useWait()
        const asyncFn = async (val) => {
          return `result-${val}`
        }
        // Pass a custom loader id to waitFor
        const wrappedFn = waitFor('custom-loader', asyncFn)
        return { wrappedFn }
      },
      template: '<div></div>'
    }

    const wrapper = mount(TestComponent)
    const waitStore = useWaitStore()

    // Call the wrapped function
    const resultPromise = wrapper.vm.wrappedFn('B')
    // The custom loader id should now be active in the global scope
    expect(waitStore.loaders.__global__['custom-loader']).toBe(true)
    const result = await resultPromise
    await nextTick()
    // After completion, the loader should be deactivated
    expect(waitStore.loaders.__global__['custom-loader']).toBe(false)
    expect(result).toBe('result-B')
  })

  it('throws an error if waitFor is called with an invalid argument', () => {
    const TestComponent = {
      setup() {
        const { waitFor } = useWait()
        return { waitFor }
      },
      template: '<div></div>'
    }

    const wrapper = mount(TestComponent)
    // Calling waitFor with a number should throw an error
    expect(() => {
      wrapper.vm.waitFor(123)
    }).toThrow('The first argument must be a function or a string')
  })

  it('uses the component instance uid as scope key when scoped is true', async () => {
    const TestComponent = {
      setup() {
        const instance = getCurrentInstance()
        const { start, waiting } = useWait({ scoped: true })
        // Expose the instance uid for testing
        return { start, waiting, instanceUid: instance.uid }
      },
      template: '<div></div>'
    }

    const wrapper = mount(TestComponent)
    const waitStore = useWaitStore()

    // For scoped usage, the wait store should use the component uid instead of the global key.
    expect(waitStore.loaders[wrapper.vm.instanceUid]).toBeUndefined()

    // Call start with a specific loader id
    wrapper.vm.start('loaderScoped')
    await nextTick()
    // Verify that the loader is stored under the component's uid key
    expect(waitStore.loaders[wrapper.vm.instanceUid]).toBeDefined()
    expect(waitStore.loaders[wrapper.vm.instanceUid].loaderScoped).toBe(true)
    expect(wrapper.vm.waiting('loaderScoped')).toBe(true)
  })
})
