import { uniqueId, cloneDeep } from 'lodash'

import { useHooksStore } from '@/store/modules/hooks'

/**
  Mixin class extending the core to add helpers for hooks.
  @mixin HooksMixin
  @typicalname datashare
*/
const HooksMixin = (superclass) =>
  class extends superclass {
    get hooksStore() {
      return useHooksStore()
    }
    /**
     * Register a hook
     * @memberof HooksMixin.prototype
     * @param {...Mixed} args - Hook's options
     * @param {String} args.name - Name of the hook
     * @param {String} args.target - Target of the hook
     * @param {Number} args.order - Priority of the hook
     * @param {Object} args.definition - Options to pass to the hook constructor
     */
    registerHook(...args) {
      this.hooksStore.register(...args)
    }
    /**
     * Unregister a specific hook
     * @memberof HooksMixin.prototype
     * @param {String} name - Name of the hook
     */
    unregisterHook(...args) {
      this.hooksStore.unregister(...args)
    }
    /**
     * Unregister all hooks from a target
     * @param {String} name - Name of the target
     * @memberof HooksMixin.prototype
     */
    resetHook(name) {
      this.hooksStore.resetTarget(name)
    }
    /**
     * Unregister all hooks, on every targets
     * @memberof HooksMixin.prototype
     */
    resetHooks() {
      this.hooksStore.reset()
    }
    /**
     * Register a hook for a specific project
     * @memberof HooksMixin.prototype
     * @param {String} project - Project to add this hook to
     * @param {Object} options - Hook's options
     * @param {String} options.name - Name of the hook
     * @param {String} options.target - Target of the hook
     * @param {Number} options.order - Priority of the hook
     * @param {Object} options.definition - Options to pass to the hook constructor
     */
    registerHookForProject(project, options) {
      options = cloneDeep(options)
      options.name = options.name || uniqueId('core:hooked-component-')
      // Watch store mutations
      return this.toggleForProject({
        project,
        // Conditional callbacks
        withFn: () => this.registerHook(options),
        withoutFn: () => this.unregisterHook(options.name)
      })
    }
  }

export default HooksMixin
