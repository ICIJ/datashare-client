import cloneDeep from 'lodash/cloneDeep'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import Vue from 'vue'

import elasticsearch from '@/api/elasticsearch'
import FilterPath from '@/store/filters/FilterPath'
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
  getFilter (state, getters) {
    return predicate => find(getters.instantiatedFilters, predicate)
  },
  instantiatedFilters (state) {
    const filter = new FilterPath({ name: 'path', key: 'byDirname', icon: 'hdd' })
    filter.bindState(state)
    return [filter]
  },
  instantiateWidget (state) {
    return ({ type = 'WidgetEmpty', ...options } = {}) => {
      const Type = widgetTypes[type]
      const widget = new Type(options)
      // Bind current state to be able to retrieve its values
      widget.bindState(state)
      // Return the instance
      return widget
    }
  },
  instantiatedWidgets (state, getters) {
    return state.widgets.map(widget => getters.instantiateWidget(widget))
  }
}

const actions = {
  queryFilter ({ state, getters, rootGetters }, { name, options, filters }) {
    return elasticsearch.searchFilter(
      state.index,
      rootGetters['search/getFilter']({ name }),
      '*',
      filters,
      false,
      options,
      []
    )
  }
}

export default { state, getters, mutations, actions, namespaced: true }
