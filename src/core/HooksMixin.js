const HooksMixins = superclass => class extends superclass {
  registerHook (...args) {
    this.store.commit('hooks/register', ...args)
  }
  resetHook (name) {
    this.store.commit('hooks/resetTarget', name)
  }
  resetHooks () {
    this.store.commit('hooks/reset', name)
  }
}

export default HooksMixins
