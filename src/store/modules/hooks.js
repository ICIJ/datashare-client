import filter from 'lodash/filter'
import orderBy from 'lodash/orderBy'
import HookedComponent from '@/utils/hookedComponent'

export const state = {
  // A list of registered hooks
  registered: []
}

export const getters = {
  hookedComponents (state) {
    return orderBy(state.registered.map(HookedComponent.create), 'order', 'asc')
  },
  filterHookedComponentsByTarget (state, getter) {
    return target => filter(getter.hookedComponents, { target })
  }
}

export const mutations = {
  register (state, { target, order, definition }) {
    state.registered.push({ target, order, definition })
  },
  reset (state) {
    state.registered = []
  },
  resetTarget (state, target) {
    state.registered = filter(state.registered, r => r.target !== target)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}
