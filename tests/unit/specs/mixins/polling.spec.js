import { createLocalVue, shallowMount } from '@vue/test-utils'
import polling from '@/mixins/polling'

// A few helper functions
const flushPromises = () => new Promise((resolve) => setImmediate(resolve))
const flushPromisesAndPendingTimers = async () => {
  jest.runOnlyPendingTimers()
  await flushPromises()
}
const flushPromisesAndAdvanceTimers = async (time) => {
  jest.advanceTimersByTime(time)
  await flushPromises()
}

// Use fake timers to control times!
// @see https://jestjs.io/fr/docs/timer-mocks
jest.useFakeTimers()

describe('polling mixin', () => {
  let wrapper

  beforeEach(() => {
    const localVue = createLocalVue()
    const Component = { template: '<div>foo</div>', mixins: [polling] }
    wrapper = shallowMount(Component, { localVue })
  })

  it('should register a polling function repeatedly called', async () => {
    const fn = jest.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(1)
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(2)
  })

  it('should register a polling function with function to calculate its timeout', async () => {
    const fn = jest.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: () => 1000 })
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(1)
  })

  it('should register two polling functions called at least once', async () => {
    const fnBar = jest.fn().mockReturnValue(Promise.resolve(true))
    const fnFoo = jest.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn: fnBar, timeout: 1000 })
    wrapper.vm.registerPoll({ fn: fnFoo, timeout: 1000 })
    await flushPromisesAndPendingTimers()
    expect(fnBar).toBeCalledTimes(1)
    expect(fnFoo).toBeCalledTimes(1)
  })

  it('should register one polling function called once when the promise returns false', async () => {
    const fn = jest.fn().mockReturnValue(Promise.resolve(false))
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(1)
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(1)
  })

  it('should register one polling function called once when the promise is rejected', async () => {
    const fn = jest.fn().mockReturnValue(Promise.reject(new Error()))
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(1)
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(1)
  })

  it('should register one polling function called twice', async () => {
    let count = 0
    const fn = jest.fn().mockImplementation(async () => ++count < 2)
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(1)
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(2)
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(2)
  })

  it('should not call a polling function after the component is destroy', async () => {
    const fn = jest.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(1)
    wrapper.destroy()
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(1)
  })

  it('should unregister a polling function after the component is destroy', async () => {
    const fn = jest.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    expect(wrapper.vm.registeredPolls).toHaveLength(1)
    wrapper.destroy()
    expect(wrapper.vm.registeredPolls).toHaveLength(0)
  })

  it('should unregister a polling function after the component is destroy', async () => {
    const fn = jest.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    expect(wrapper.vm.registeredPolls).toHaveLength(1)
    wrapper.destroy()
    expect(wrapper.vm.registeredPolls).toHaveLength(0)
  })

  it('should call a polling function 2 times in 2000ms', async () => {
    const fn = jest.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    await flushPromisesAndAdvanceTimers(500)
    expect(fn).toBeCalledTimes(0)
    await flushPromisesAndAdvanceTimers(500)
    expect(fn).toBeCalledTimes(1)
    await flushPromisesAndAdvanceTimers(500)
    expect(fn).toBeCalledTimes(1)
    await flushPromisesAndAdvanceTimers(500)
    expect(fn).toBeCalledTimes(2)
  })

  it('should call a polling immediatly even before its timeout', async () => {
    const fn = jest.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: 1000, immediate: true })
    await flushPromisesAndAdvanceTimers(500)
    expect(fn).toBeCalledTimes(1)
  })

  it('should call a polling once even if register twice', async () => {
    const fn = jest.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPollOnce({ fn, timeout: 1000, immediate: true })
    wrapper.vm.registerPollOnce({ fn, timeout: 1000, immediate: true })
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(1)
  })

  it('should call a polling twice if register twice', async () => {
    const fn = jest.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: 1000, immediate: true })
    wrapper.vm.registerPoll({ fn, timeout: 1000, immediate: true })
    await flushPromisesAndPendingTimers()
    expect(fn).toBeCalledTimes(2)
  })
})
