import { findIndex, cloneDeep } from 'lodash'
import Vue from 'vue'

import widgets from '@/store/widgets'
import * as widgetTypes from '@/store/widgets'

export function initialState () {
  return cloneDeep({ widgets })
}
const state = initialState()

const mutations = {
  reset (state) {
    const s = initialState()
    Object.keys(s).forEach(key => Vue.set(state, key, s[key]))
  },
  removeWidget (state, name) {
    const index = findIndex(state.widgets, (options) => options.name === name)
    Vue.delete(state.widgets, index)
  },
  addWidget (state, options) {
    state.widgets.push(options)
  },
  clearWidgets (state) {
    Vue.set(state, 'widgets', [])
  }
}

export const getters = {
  instantiateWidget (state) {
    return ({ type = 'WidgetEmpty', ...options } = {}) => {
      const Type = widgetTypes[type]
      const filter = new Type(options)
      // Bind current state to be able to retrieve its values
      filter.bindState(state)
      // Return the instance
      return filter
    }
  },
  instantiatedWidgets (state, getters) {
    return state.widgets.map(filter => {
      return getters.instantiateWidget(filter)
    })
  }
}

export default { state, getters, mutations, namespaced: true }
