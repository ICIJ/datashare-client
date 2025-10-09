import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import find from 'lodash/find'
import findIndex from 'lodash/findIndex'
import isString from 'lodash/isString'
import isFunction from 'lodash/isFunction'
import sortBy from 'lodash/sortBy'

import widgetsDefs from '@/store/widgets'
import * as widgetTypes from '@/store/widgets'

export const useInsightsStore = defineStore('insights', () => {
  const project = ref('')
  const widgets = ref(cloneDeep(widgetsDefs))

  /**
   * Sets the current project. This is particularly useful when
   * subscribing to the store actions.
   *
   * @param {string} value - The name of the project.
   */
  function setProject(value) {
    project.value = value ?? project.value
  }

  /**
   * Resets the state to its initial values.
   */
  function reset() {
    project.value = ''
    widgets.value = cloneDeep(widgetsDefs)
  }

  /**
   * Removes a widget from the state by its name.
   *
   * @param {string} name - The name of the widget to remove.
   */
  function removeWidget(name) {
    const index = findIndex(widgets.value, options => options.name === name)
    if (index !== -1) {
      widgets.value.splice(index, 1)
    }
  }

  /**
   * Adds a widget to the state if it does not already exist.
   *
   * @param {Object} options - The widget options.
   * @param {string} options.name - The name of the widget.
   */
  function addWidget(options) {
    if (!options.name || !find(widgets.value, { name: options.name })) {
      widgets.value.push(options)
    }
  }

  /**
   * Clears all widgets from the state.
   */
  function clearWidgets() {
    widgets.value = []
  }

  /**
   * Returns a widget class based on the provided type.
   *
   * @param {string|Function|Object} type - The widget type.
   * @returns {Function} The widget class.
   * @throws {Error} Throws an error if the widget type is not valid.
   */
  function getWidgetClass(type) {
    if (isString(type) && type in widgetTypes) {
      return widgetTypes[type]
    }

    if (type?.prototype instanceof widgetTypes.WidgetEmpty) {
      return type
    }

    if (isFunction(type)) {
      return type(widgetTypes.WidgetEmpty)
    }

    throw new Error(`Cannot find widget type '${type}'`)
  }

  /**
   * Finds a widget in the state that satisfies the provided predicate.
   *
   * @param {Function} predicate - A function that tests each widget.
   * @returns {Object|undefined} The found widget, or undefined if not found.
   */
  function getWidget(predicate) {
    return find(widgets.value, predicate)
  }

  /**
   * Instantiates a widget using its type and options.
   *
   * Binds the current state to the widget instance.
   *
   * @param {Object} [options={}] - The options for instantiating the widget.
   * @param {string|Function|Object} [options.type='WidgetEmpty'] - The widget type.
   * @returns {Object} The instantiated widget.
   */
  function instantiateWidget({ type = 'WidgetEmpty', ...options } = {}) {
    const Type = getWidgetClass(type)
    return new Type(options)
  }

  /**
   * Returns the list of instantiated widgets, sorted by their 'order' property.
   *
   * @returns {Array<Object>} The sorted list of widget instances.
   */
  const instantiatedWidgets = computed(() => {
    return sortBy(widgets.value.map(instantiateWidget), ['order'])
  })

  return {
    project,
    reset,
    setProject,
    removeWidget,
    addWidget,
    clearWidgets,
    getWidgetClass,
    getWidget,
    instantiateWidget,
    instantiatedWidgets,
    widgets
  }
})
