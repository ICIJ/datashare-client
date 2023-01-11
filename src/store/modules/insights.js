import cloneDeep from 'lodash/cloneDeep'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import sortBy from 'lodash/sortBy'
import Vue from 'vue'

import widgets from '@/store/widgets'
import * as widgetTypes from '@/store/widgets'

export function initialState() {
  return {
    project: '',
    widgets: cloneDeep({ widgets }).widgets
  }
}

const state = initialState()

const mutations = {
  reset(state) {
    const s = initialState()
    Object.keys(s).forEach((key) => Vue.set(state, key, s[key]))
  },
  removeWidget(state, name) {
    const index = findIndex(state.widgets, (options) => options.name === name)
    Vue.delete(state.widgets, index)
  },
  addWidget(state, options) {
    if (!options.name || !find(state.widgets, { name: options.name })) {
      state.widgets.push(options)
    }
  },
  clearWidgets(state) {
    Vue.set(state, 'widgets', [])
  },
  project(state, project) {
    Vue.set(state, 'project', project)
  }
}

export const getters = {
  getWidget(state, getters) {
    return (predicate) => find(state.widgets, predicate)
  },
  instantiateWidget(state) {
    return ({ type = 'WidgetEmpty', ...options } = {}) => {
      const Type = widgetTypes[type]
      const widget = new Type(options)
      // Bind current state to be able to retrieve its values
      widget.bindState(state)
      // Return the instance
      return widget
    }
  },
  instantiatedWidgets(state, getters) {
    const widgets = state.widgets.map(getters.instantiateWidget)
    return sortBy(widgets, ['order'])
  }
}

export default { state, getters, mutations, namespaced: true }
