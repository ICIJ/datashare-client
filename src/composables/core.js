import { getCurrentInstance } from 'vue'

export function useCore() {
  // `getCurrentInstance` is a Vue Composition API function that gives us access to the current component instance.
  // This is essential because we need the instance to access global properties like `$core` and `$toast`.
  const instance = getCurrentInstance()

  // If `getCurrentInstance` is called outside of a Vue component setup function, it will return `null`.
  // In this case, we throw an error to alert the developer that `useCore` should only be used inside a setup function.
  if (!instance) {
    throw new Error('useCore must be called within a Vue component setup function.')
  }

  // The `instance` object has a `proxy` property, which is the component's public instance.
  // This `proxy` allows us to access properties like `$core` and `$toast` that are globally provided by the "core" plugin.
  const { proxy } = instance

  function toastedPromise(promise, { successMessage, errorMessage }) {
    return promise.then(
      (data) => {
        if (successMessage) proxy.$toast.success(successMessage)
        return data
      },
      (err) => {
        if (errorMessage) proxy.$toast.error(errorMessage)
        throw err
      }
    )
  }

  // We return an object with the global `$core` and `$toast` properties.
  // These properties can then be destructured and used in any component that calls `useCore`.
  return {
    // `proxy.$core` gives us access to the global `$core` object provided by the "core" plugin.
    core: proxy.$core,
    // `proxy.$toast` gives us access to the global `$toast` object provided by the "core" plugin.
    toast: proxy.$toast,
    // `proxy.$wait` gives us access to the global `$wait` object provided by the "core" plugin
    wait: proxy.$wait,
    toastedPromise
  }
}
