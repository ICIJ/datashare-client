import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

import { usePolling } from '@/composables/usePolling'

function mountComposable() {
  let result
  const wrapper = mount(defineComponent({
    setup() {
      result = usePolling()
      return () => h('div')
    }
  }))
  return { wrapper, result }
}

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should keep a single poll running when registering the same function again', async () => {
    const { result } = mountComposable()
    const fn = vi.fn().mockResolvedValue(true)
    result.registerPollOnce({ fn, timeout: 1000 })
    result.registerPollOnce({ fn, timeout: 1000 })
    await vi.advanceTimersByTimeAsync(3000)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should only unregister the poll matching the given function', async () => {
    const { result } = mountComposable()
    const fn = vi.fn().mockResolvedValue(true)
    const other = vi.fn().mockResolvedValue(true)
    result.registerPoll({ fn, timeout: 1000 })
    result.registerPoll({ fn: other, timeout: 1000 })
    result.unregisteredPoll({ fn })
    await vi.advanceTimersByTimeAsync(2000)
    expect(fn).not.toHaveBeenCalled()
    expect(other).toHaveBeenCalledTimes(2)
  })

  it('should ignore an unknown function', async () => {
    const { result } = mountComposable()
    const fn = vi.fn().mockResolvedValue(true)
    result.registerPoll({ fn, timeout: 1000 })
    result.unregisteredPoll({ fn: vi.fn() })
    await vi.advanceTimersByTimeAsync(2000)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should not reschedule a poll replaced while its function was running', async () => {
    const { result } = mountComposable()
    const fn = vi.fn(() => new Promise(resolve => setTimeout(() => resolve(true), 500)))
    result.registerPoll({ fn, timeout: 1000 })
    // The first call is in flight when the poll is registered again
    await vi.advanceTimersByTimeAsync(1200)
    result.registerPollOnce({ fn, timeout: 1000 })
    fn.mockClear()
    // Each round takes 1500ms (1000ms timeout + 500ms call), so only two rounds can start
    await vi.advanceTimersByTimeAsync(3000)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should stop every poll on unmount', async () => {
    const { wrapper, result } = mountComposable()
    const fns = [vi.fn().mockResolvedValue(true), vi.fn().mockResolvedValue(true), vi.fn().mockResolvedValue(true)]
    fns.forEach(fn => result.registerPoll({ fn, timeout: 1000 }))
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(2000)
    fns.forEach(fn => expect(fn).not.toHaveBeenCalled())
  })
})
