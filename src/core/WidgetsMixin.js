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
}

export default WidgetsMixins
