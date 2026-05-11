// Fakes only macrotask timers so polling intervals don't bleed between tests,
// while leaving setImmediate real so flushPromises() still works.
export function useTaskTimerSetup() {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })
}
