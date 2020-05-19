import { uniqueId, cloneDeep } from 'lodash'

const WidgetsMixins = superclass => class extends superclass {
  registerWidget (...args) {
    this.store.commit('insights/addWidget', ...args)
  }
  unregisterWidget (...args) {
    this.store.commit('insights/removeWidget', ...args)
  }
  clearWidgets () {
    this.store.commit('insights/clearWidgets')
  }
  registerWidgetForProject (project, options) {
    options = cloneDeep(options)
    options.name = options.name || uniqueId('core:insight-')
    // Watch store mutations
    return this.toggleForProject({
      project,
      // Conditional callbacks
      withFn: () => this.registerWidget(options),
      withoutFn: () => this.unregisterWidget(options.name)
    })
  }
  replaceWidget (name, options) {
    // Unregister existing widget
    this.unregisterWidget(name)
    // Register the new one and ensure the "name" of the widget
    // is the same than the one we replace
    this.registerWidget({ ...options, name })
  }
  replaceWidgetForProject (project, name, options) {
    // Save the initial option of the existing widget
    const initialOptions = this.store.getters['insights/getWidget']({ name })
    // Watch store mutations
    return this.toggleForProject({
      project,
      // Conditional callbacks
      withFn: () => {
        // Unregister existing widget
        this.unregisterWidget(name)
        // Register the new one and ensure the "name" of the widget
        // is the same than the one we replace
        this.registerWidget({ ...options, name })
      },
      withoutFn: () => {
        // Unregister existing widget
        this.unregisterWidget(name)
        // Restore the initial valu
        this.registerWidget({ ...initialOptions })
      }
    })
  }
}

export default WidgetsMixins
