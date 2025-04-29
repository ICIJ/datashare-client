import nprogress from 'nprogress'
import { computed, toRef, watchEffect, getCurrentScope, onScopeDispose } from 'vue'

export function useNProgress(currentProgress = null, options = {}) {
  const progress = toRef(currentProgress)

  const setProgress = nprogress.set
  // Override the set method to update the progress value when the progress
  // bar is set manually. This is useful to keep the progress value in sync with
  // the nprogress instance.
  nprogress.set = (n) => {
    progress.value = n
    return setProgress.call(nprogress, n)
  }

  watchEffect(() => {
    if (typeof progress.value === 'number') {
      setProgress.call(nprogress, progress.value)
    }
  })

  // Disable the spinner by default
  nprogress.configure({ showSpinner: false, ...options })

  // Remove the progress bar when the scope is disposed. This is useful when the
  // progress bar is used outside of the component lifecycle.
  // @see https://vuejs.org/api/reactivity-advanced.html#onscopedispose
  if (getCurrentScope()) {
    onScopeDispose(nprogress.remove)
  }

  const start = nprogress.start
  const done = nprogress.done
  const toggle = (value = !isLoading.value) => (value ? start() : done())

  const isLoading = computed({
    set: toggle,
    get: () => typeof progress.value === 'number' && progress.value < 1
  })

  const remove = () => {
    progress.value = null
    nprogress.remove()
  }

  return { isLoading, progress, start, done, toggle, remove }
}
