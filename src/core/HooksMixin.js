import { uniqueId, cloneDeep } from 'lodash'

const HooksMixins = superclass => class extends superclass {
  registerHook (...args) {
    this.store.commit('hooks/register', ...args)
  }
  unregisterHook (...args) {
    this.store.commit('hooks/unregister', ...args)
  }
  resetHook (name) {
    this.store.commit('hooks/resetTarget', name)
  }
  resetHooks () {
    this.store.commit('hooks/reset', name)
  }
  registerHookForProject (project, options) {
    options = cloneDeep(options)
    options.name = options.name || uniqueId('hooked-component-')
    // Watch store mutations
    return this.toggleForProject({
      project,
      // Conditional callbacks
      withFn: () => this.registerHook(options),
      withoutFn: () => this.unregisterHook(options.name)
    })
  }
}

export default HooksMixins
