import cloneDeep from 'lodash/cloneDeep'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import sortBy from 'lodash/sortBy'
import Vue from 'vue'

import elasticsearch from '@/api/elasticsearch'
import FilterPath from '@/store/filters/FilterPath'
import widgets from '@/store/widgets'
import * as widgetTypes from '@/store/widgets'

export function initialState () {
  return {
    project: '',
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
  project (state, project) {
    Vue.set(state, 'project', project)
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
    const widgets = state.widgets.map(getters.instantiateWidget)
    return sortBy(widgets, ['order'])
  }
}

const actions = {
  queryFilter ({ state, getters, rootGetters }, { name, options, filters }) {
    return elasticsearch.searchFilter(
      state.project,
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
