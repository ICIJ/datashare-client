import { cloneDeep, findIndex } from 'lodash'
import Vue from 'vue'

import elasticsearch from '@/api/elasticsearch'
import widgets from '@/store/widgets'
import * as widgetTypes from '@/store/widgets'

export function initialState () {
  return {
    index: '',
    widgets: cloneDeep({ widgets }).widgets
  }
}

const state = initialState()

const mutations = {
  reset (state) {
    const s = initialState()
    Object.keys(s).forEach(key => Vue.set(state, key, s[key]))
  },
  removeWidget (state, name) {
    const index = findIndex(state.widgets, options => options.name === name)
    Vue.delete(state.widgets, index)
  },
  addWidget (state, options) {
    state.widgets.push(options)
  },
  clearWidgets (state) {
    Vue.set(state, 'widgets', [])
  },
  index (state, index) {
    Vue.set(state, 'index', index)
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
    return state.widgets.map(filter => getters.instantiateWidget(filter))
  }
}

const actions = {
  queryFilter ({ state, getters, rootGetters }, params) {
    return elasticsearch.searchFilter(
      state.index,
      rootGetters['search/getFilter']({ name: params.name }),
      '*',
      [],
      false,
      params.options,
      []
    )
  }
}

export default { state, getters, mutations, actions, namespaced: true }
