import { ref } from 'vue'

import { awaitWhenever } from '@/composables/awaitWhenever'

function createManualPromise() {
  let resolve
  let reject

  // eslint-disable-next-line promise/param-names
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

describe('awaitWhenever', () => {
  describe('synchronous fn', () => {
    it('calls fn synchronously when condition fn returns false', async () => {
      const fn = vi.fn()
      const result = await awaitWhenever(fn, () => false)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(result).toBeUndefined()
    })

    it('awaits and calls fn when condition fn returns true', async () => {
      const fn = vi.fn()
      const result = await awaitWhenever(fn, () => true)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(result).toBeUndefined()
    })

    it('works with literal booleans: true', async () => {
      const fn = vi.fn()
      await awaitWhenever(fn, true)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('works with literal booleans: false', async () => {
      const fn = vi.fn()
      await awaitWhenever(fn, false)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('async fn + manual promise', () => {
    it('awaits async fn when condition function is truthy', async () => {
      const { promise, resolve } = createManualPromise()
      let sideEffect = 0
      const fn = vi.fn(() =>
        promise.then((n) => {
          sideEffect = n
        })
      )
      const task = awaitWhenever(fn, () => true)

      // still pending because await(fn) is waiting on the manual promise
      expect(fn).toHaveBeenCalledTimes(1)
      expect(sideEffect).toBe(0)

      resolve(42)
      await task

      expect(sideEffect).toBe(42)
    })

    it('does NOT await async fn when condition function is falsy', async () => {
      const { promise, resolve } = createManualPromise()
      let sideEffect = 0
      const fn = vi.fn(() =>
        promise.then((n) => {
          sideEffect = n
        })
      )
      const task = awaitWhenever(fn, () => false)

      // fn called, but awaitWhenever returned immediately
      expect(fn).toHaveBeenCalledTimes(1)
      await task
      expect(sideEffect).toBe(0)

      // now resolve, fn's internal handler runs
      resolve(99)
      await promise
      expect(sideEffect).toBe(99)
    })
  })

  describe('using Vue refs', () => {
    it('awaits when ref.value is true', async () => {
      const flag = ref(false)
      const { promise, resolve } = createManualPromise()
      let result = ''
      const fn = vi.fn(() =>
        promise.then((s) => {
          result = s
        })
      )

      // flip the flag to trigger awaiting
      flag.value = true
      const task = awaitWhenever(fn, flag)

      expect(fn).toHaveBeenCalledOnce()
      expect(result).toBe('')
      resolve('vue!')
      await task
      expect(result).toBe('vue!')
    })

    it('does NOT await when ref.value is false', async () => {
      const flag = ref(false)
      const { promise, resolve } = createManualPromise()
      let result = ''
      const fn = vi.fn(() =>
        promise.then((s) => {
          result = s
        })
      )

      const task = awaitWhenever(fn, flag)

      expect(fn).toHaveBeenCalledOnce()
      await task
      expect(result).toBe('')

      resolve('later')
      await promise
      expect(result).toBe('later')
    })
  })

  describe('edge-case truthy/falsy values via toValue', () => {
    it('treats ref(1) as truthy and awaits', async () => {
      const flag = ref(1)
      const { promise, resolve } = createManualPromise()
      let done = false
      const fn = vi.fn(() =>
        promise.then(() => {
          done = true
        })
      )

      const task = awaitWhenever(fn, flag)
      resolve(true)
      await task
      expect(done).toBe(true)
    })

    it('treats ref(0) as falsy and does NOT await', async () => {
      const flag = ref(0)
      const { promise, resolve } = createManualPromise()
      let done = false
      const fn = vi.fn(() =>
        promise.then(() => {
          done = true
        })
      )

      const task = awaitWhenever(fn, flag)
      await task
      expect(done).toBe(false)
      resolve(true)
      await promise
      expect(done).toBe(true)
    })
  })
})
