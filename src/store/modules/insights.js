import cloneDeep from 'lodash/cloneDeep'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import isString from 'lodash/isString'
import isFunction from 'lodash/isFunction'
import sortBy from 'lodash/sortBy'

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
    Object.keys(s).forEach((key) => {
      state[key] = s[key]
    })
  },
  removeWidget(state, name) {
    const index = findIndex(state.widgets, (options) => options.name === name)
    state.widgets.splice(index, 1)
  },
  addWidget(state, options) {
    if (!options.name || !find(state.widgets, { name: options.name })) {
      state.widgets.push(options)
    }
  },
  clearWidgets(state) {
    state.widgets = []
  },
  project(state, project) {
    state.project = project
  }
}

export const getters = {
  getWidgetClass() {
    return (type) => {
      // Check if the provided 'type' is a string and exists in the 'widgetTypes' object
      if (isString(type) && type in widgetTypes) {
        // Return the corresponding widget class from 'widgetTypes'
        return widgetTypes[type]
      }
      // Check if the 'type' is an object and an instance of the 'WidgetEmpty' class
      if (type?.prototype instanceof widgetTypes.WidgetEmpty) {
        // Return the 'type' itself as it is a valid widget class
        return type
      }
      // Check if the 'type' is a function
      if (isFunction(type)) {
        // Call the 'type' function with 'WidgetEmpty' as an argument and return the result
        return type(widgetTypes.WidgetEmpty)
      }
      // If none of the above conditions are met, throw an error as the provided 'type' is not valid
      throw new Error(`Cannot find widget type '${type}'`)
    }
  },
  getWidget(state) {
    return (predicate) => find(state.widgets, predicate)
  },
  instantiateWidget(state, getters) {
    return ({ type = 'WidgetEmpty', ...options } = {}) => {
      const Type = getters.getWidgetClass(type)
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
