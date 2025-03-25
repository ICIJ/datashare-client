import { computed, getCurrentInstance, useId, toRef } from 'vue'

export function useWait() {
  const instance = getCurrentInstance()

  // If `getCurrentInstance` is called outside of a Vue component setup function, it will return `null`.
  if (!instance) {
    throw new Error('useCore must be called within a Vue component setup function.')
  }

  // The `instance` object has a `proxy` property, which is the component's public instance.
  // `proxy.$wait` gives us access to the global `$wait` object provided by vue-wait
  const {
    proxy: { $wait }
  } = instance

  const loaderId = useId()
  const isLoading = computed(() => $wait.is(loaderId))

  // `waitFor` is a higher-order function that takes an `id` and a function `fn`.
  const waitFor = (id, fn) => {
    const idRef = toRef(id)

    return async (...args) => {
      $wait.start(idRef.value)
      const promise = await fn(...args)
      $wait.end(idRef.value)
      return promise
    }
  }

  // `wait` is a helper function that takes a function `fn` and waits for the loader to finish.
  const wait = (fn) => waitFor(loaderId, fn)

  return { $wait, waitFor, wait, isLoading, loaderId }
}
