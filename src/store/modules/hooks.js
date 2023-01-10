import filter from 'lodash/filter'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import orderBy from 'lodash/orderBy'
import { HookedComponent } from '@/store/hooks'

export const state = {
  // A list of registered hooks
  registered: []
}

export const getters = {
  hookedComponents(state) {
    return () => {
      return orderBy(state.registered.map(HookedComponent.create), 'order', 'asc')
    }
  },
  filterHookedComponentsByTarget(state, getters) {
    return (target) => filter(getters.hookedComponents(), { target })
  },
  getHookedComponentByName(state, getters) {
    return (name) => find(getters.hookedComponents(), { name })
  }
}

export const mutations = {
  register(state, { target, order, name, definition }) {
    const index = name ? findIndex(state.registered, { name }) : -1
    if (index === -1) {
      state.registered.push({ target, order, name, definition })
    }
  },
  unregister(state, name) {
    const index = findIndex(state.registered, { name })
    if (index > -1) {
      state.registered.splice(index, 1)
    }
  },
  reset(state) {
    state.registered.splice(0, state.registered.length)
  },
  resetTarget(state, target) {
    state.registered = filter(state.registered, (r) => r.target !== target)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}
