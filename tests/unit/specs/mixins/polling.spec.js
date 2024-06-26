import { shallowMount } from '@vue/test-utils'

import polling from '@/mixins/polling'

describe('polling mixin', () => {
  let wrapper

  const flushPromisesAndPendingTimers = async ({ vm }) => {
    await vm.$nextTick()
    await vi.runOnlyPendingTimersAsync()
  }

  const flushPromisesAndAdvanceTimers = async ({ vm }, time) => {
    await vm.$nextTick()
    await vi.advanceTimersByTimeAsync(time)
  }

  beforeEach(() => {
    vi.useFakeTimers()
    const Component = { template: '<div>foo</div>', mixins: [polling] }
    wrapper = shallowMount(Component)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should register a polling function repeatedly called', async () => {
    const fn = vi.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(1)
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(2)
  })

  it('should register a polling function with function to calculate its timeout', async () => {
    const fn = vi.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: () => 1000 })
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(1)
  })

  it('should register two polling functions called at least once', async () => {
    const fnBar = vi.fn().mockReturnValue(Promise.resolve(true))
    const fnFoo = vi.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn: fnBar, timeout: 1000 })
    wrapper.vm.registerPoll({ fn: fnFoo, timeout: 1000 })
    await flushPromisesAndPendingTimers(wrapper)
    expect(fnBar).toBeCalledTimes(1)
    expect(fnFoo).toBeCalledTimes(1)
  })

  it('should register one polling function called once when the promise returns false', async () => {
    const fn = vi.fn().mockReturnValue(Promise.resolve(false))
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(1)
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(1)
  })

  it('should register one polling function called once when the promise is rejected', async () => {
    const fn = vi.fn().mockImplementation(() => Promise.reject(new Error()))
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(1)
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(1)
  })

  it('should register one polling function called twice', async () => {
    let count = 0
    const fn = vi.fn().mockImplementation(async () => ++count < 2)
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(1)
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(2)
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(2)
  })

  it('should not call a polling function after the component is destroyed', async () => {
    const fn = vi.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(1)
    wrapper.unmount()
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(1)
  })

  it('should unregister a polling function after the component is destroyed', async () => {
    const fn = vi.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    expect(wrapper.vm.registeredPolls).toHaveLength(1)
    wrapper.unmount()
    expect(wrapper.vm.registeredPolls).toHaveLength(0)
  })

  it('should call a polling function 2 times in 2000ms', async () => {
    const fn = vi.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: 1000 })
    await flushPromisesAndAdvanceTimers(wrapper, 500)
    expect(fn).toBeCalledTimes(0)
    await flushPromisesAndAdvanceTimers(wrapper, 500)
    expect(fn).toBeCalledTimes(1)
    await flushPromisesAndAdvanceTimers(wrapper, 500)
    expect(fn).toBeCalledTimes(1)
    await flushPromisesAndAdvanceTimers(wrapper, 500)
    expect(fn).toBeCalledTimes(2)
  })

  it('should call a polling immediatly even before its timeout', async () => {
    const fn = vi.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: 1000, immediate: true })
    await flushPromisesAndAdvanceTimers(wrapper, 500)
    expect(fn).toBeCalledTimes(1)
  })

  it('should call a polling once even if register twice', async () => {
    const fn = vi.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPollOnce({ fn, timeout: 1000, immediate: true })
    wrapper.vm.registerPollOnce({ fn, timeout: 1000, immediate: true })
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(1)
  })

  it('should call a polling twice if register twice', async () => {
    const fn = vi.fn().mockReturnValue(Promise.resolve(true))
    wrapper.vm.registerPoll({ fn, timeout: 1000, immediate: true })
    wrapper.vm.registerPoll({ fn, timeout: 1000, immediate: true })
    await flushPromisesAndPendingTimers(wrapper)
    expect(fn).toBeCalledTimes(2)
  })
})
