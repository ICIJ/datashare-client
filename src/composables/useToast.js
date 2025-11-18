import { getCurrentInstance } from 'vue'
import { isFunction } from 'lodash'

export function useToast() {
  // `getCurrentInstance` is a Vue Composition API function that gives us access to the current component instance.
  // This is essential because we need the instance to access global properties like `$toast`.
  const instance = getCurrentInstance()

  // If `getCurrentInstance` is called outside of a Vue component setup function, it will return `null`.
  // In this case, we throw an error to alert the developer that `useToast` should only be used inside a setup function.
  if (!instance) {
    throw new Error('useToast must be called within a Vue component setup function.')
  }

  // The `instance` object has a `proxy` property, which is the component's public instance.
  // This `proxy` allows us to access properties like `$toast` that are globally provided by the "core" plugin.
  const { proxy } = instance
  const toast = proxy.$toast

  function toastedPromise(promise, { successMessage, errorMessage }) {
    return promise.then(
      (data) => {
        if (successMessage) {
          toast.success(successMessage)
        }
        return data
      },
      (err) => {
        if (errorMessage) {
          if (isFunction(errorMessage)) {
            toast.error(errorMessage(err))
          }
          else {
            toast.error(errorMessage)
          }
        }
        throw err
      }
    )
  }

  // We return an object with the global `$toast` property and the `toastedPromise` helper.
  // These can then be destructured and used in any component that calls `useToast`.
  return {
    toast,
    toastedPromise
  }
}
