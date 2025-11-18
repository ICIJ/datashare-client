import { getCurrentInstance } from 'vue'

export function useCore() {
  // `getCurrentInstance` is a Vue Composition API function that gives us access to the current component instance.
  // This is essential because we need the instance to access global properties like `$core`.
  const instance = getCurrentInstance()

  // If `getCurrentInstance` is called outside of a Vue component setup function, it will return `null`.
  // In this case, we throw an error to alert the developer that `useCore` should only be used inside a setup function.
  if (!instance) {
    throw new Error('useCore must be called within a Vue component setup function.')
  }

  // The `instance` object has a `proxy` property, which is the component's public instance.
  // This `proxy` allows us to access properties like `$core` that are globally provided by the "core" plugin.
  const { proxy } = instance

  // Return the core instance directly for simpler usage: `const core = useCore()`
  return proxy.$core
}
