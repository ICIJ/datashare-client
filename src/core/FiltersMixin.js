const FiltersMixin = superclass => class extends superclass {
  registerFilter (...args) {
    this.store.commit('search/addFilter', ...args)
  }
  unregisterFilter (name) {
    this.store.commit('search/removeFilter', name)
  }
}

export default FiltersMixin
