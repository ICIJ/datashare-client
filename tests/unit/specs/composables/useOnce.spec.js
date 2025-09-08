import { isRef } from 'vue'
import {
  useOnce,
  ONCE_IDLE,
  ONCE_RUNNING,
  ONCE_DONE,
} from '@/composables/useOnce'

function deferred() {
  let resolve, reject
  // eslint-disable-next-line promise/param-names
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useOnce', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('returns reactive state and helpers', () => {
    const { state, running, done, run, reset } = useOnce(async () => 'ok')
    expect(typeof run).toBe('function')
    expect(typeof reset).toBe('function')
    expect(isRef(state)).toBe(true)
    expect(isRef(running)).toBe(true)
    expect(isRef(done)).toBe(true)
    expect(state.value).toBe(ONCE_IDLE)
    expect(running.value).toBe(false)
    expect(done.value).toBe(false)
  })

  it('calls only once and caches the first successful result', async () => {
    const d = deferred()
    const fn = vi.fn(() => d.promise)
    const { run, state, running, done } = useOnce(fn)

    const p1 = run('A')
    const p2 = run('B') // ignored args, should share same in-flight

    expect(fn).toHaveBeenCalledTimes(1)
    expect(state.value).toBe(ONCE_RUNNING)
    expect(running.value).toBe(true)
    expect(done.value).toBe(false)
    expect(p1).toBe(p2) // shared singleton promise

    d.resolve('RESULT')
    const r1 = await p1
    const r2 = await p2
    expect(r1).toBe('RESULT')
    expect(r2).toBe('RESULT')

    // Subsequent calls should not call fn again; return cached success.
    const p3 = run('C')
    const r3 = await p3
    expect(fn).toHaveBeenCalledTimes(1)
    expect(r3).toBe('RESULT')
    expect(state.value).toBe(ONCE_DONE)
    expect(running.value).toBe(false)
    expect(done.value).toBe(true)
  })

  it('retries after a failure (does not cache rejections)', async () => {
    const d1 = deferred()
    const d2 = deferred()
    const fn = vi
      .fn()
      .mockImplementationOnce(() => d1.promise) // first attempt fails
      .mockImplementationOnce(() => d2.promise) // second attempt succeeds

    const { run, state } = useOnce(fn)

    const p1 = run('first')
    expect(state.value).toBe(ONCE_RUNNING)
    d1.reject(new Error('boom'))

    await expect(p1).rejects.toThrow('boom')
    expect(state.value).toBe(ONCE_IDLE)

    const p2 = run('second')
    expect(fn).toHaveBeenCalledTimes(2)
    expect(state.value).toBe(ONCE_RUNNING)
    d2.resolve('OK')
    await expect(p2).resolves.toBe('OK')
    expect(state.value).toBe(ONCE_DONE)

    // third call returns cached success, no new invocations
    await expect(run('third')).resolves.toBe('OK')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('concurrent callers share the same in-flight promise', async () => {
    const d = deferred()
    const fn = vi.fn(() => d.promise)
    const { run } = useOnce(fn)

    const calls = Array.from({ length: 10 }, () => run('x'))
    expect(fn).toHaveBeenCalledTimes(1)

    d.resolve(123)
    const results = await Promise.all(calls)
    results.forEach((v) => expect(v).toBe(123))
  })

  it('reset() clears cached success and allows rerun', async () => {
    const d1 = deferred()
    const d2 = deferred()
    const fn = vi
      .fn()
      .mockImplementationOnce(() => d1.promise)
      .mockImplementationOnce(() => d2.promise)

    const { run, reset, state } = useOnce(fn)

    const p1 = run('A')
    d1.resolve('ONE')
    await expect(p1).resolves.toBe('ONE')
    expect(state.value).toBe(ONCE_DONE)
    expect(fn).toHaveBeenCalledTimes(1)

    reset()
    expect(state.value).toBe(ONCE_IDLE)

    const p2 = run('B')
    expect(fn).toHaveBeenCalledTimes(2)
    d2.resolve('TWO')
    await expect(p2).resolves.toBe('TWO')
    expect(state.value).toBe(ONCE_DONE)
  })

  it('captures arguments from the first invocation only', async () => {
    const fn = vi.fn(async (arg) => `hello:${arg}`)
    const { run } = useOnce(fn)

    const pA = run('A') // first args captured internally
    const pB = run('B') // should be ignored, same result as A

    const [ra, rb] = await Promise.all([pA, pB])
    expect(fn).toHaveBeenCalledTimes(1)
    expect(ra).toBe('hello:A')
    expect(rb).toBe('hello:A')
  })

  it('after a failed first run, next call can change the captured args', async () => {
    const d1 = deferred()
    const d2 = deferred()
    const fn = vi
      .fn()
      .mockImplementationOnce(() => d1.promise) // will reject
      .mockImplementationOnce((x) => d2.promise.then(() => `ok:${x}`))

    const { run } = useOnce(fn)

    const p1 = run('first')
    d1.reject(new Error('nope'))
    await expect(p1).rejects.toThrow('nope')

    const p2 = run('second')
    d2.resolve()
    await expect(p2).resolves.toBe('ok:second')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
