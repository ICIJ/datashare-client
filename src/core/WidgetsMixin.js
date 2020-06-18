import { uniqueId, cloneDeep } from 'lodash'

/**
  Mixin class extending the core to add helpers for widgets.
  @mixin WidgetsMixin
  @typicalname datashare
*/
const WidgetsMixin = superclass => class extends superclass {
  /**
   * Register a widget
   * @memberof WidgetsMixin.prototype
   * @param {...Mixed} args - Widget's options passed to widget constructor
   * @param {String} args.name - Name of the widget
   * @param {Boolean} args.card - Either or not this widget should be a `card` component from Boostrap.
   * @param {Number} args.cols - Number of columns to fill in the grid (from 1 to 12)
   * @param {String} [args.type=WidgetEmpty] - Type of the widget
   */
  registerWidget (...args) {
    this.store.commit('insights/addWidget', ...args)
  }
  /**
   * Unregister a widget
   * @memberof WidgetsMixin.prototype
   * @param {String} name - Name of the widget to unregister
   */
  unregisterWidget (...args) {
    this.store.commit('insights/removeWidget', ...args)
  }
  /**
   * Unregister all widgets
   * @memberof WidgetsMixin.prototype
   */
  clearWidgets () {
    this.store.commit('insights/clearWidgets')
  }
  /**
   * Register a widget for a specific project
   * @memberof WidgetsMixin.prototype
   * @param {String} project - Name of the project to add this widget to
   * @param {Object} options - Widget's options passed to widget constructor
   * @param {String} options.name - Name of the widget
   * @param {Boolean} options.card - Either or not this widget should be a `card` component from Boostrap
   * @param {Number} options.cols - Number of columns to fill in the grid (from 1 to 12)
   * @param {String} [options.type=WidgetEmpty] - Type of the widget
   */
  registerWidgetForProject (project, options) {
    options = cloneDeep(options)
    const name = options.name || uniqueId('core:insight-')
    // Watch store mutations
    return this.toggleForProject({
      project,
      // Widgets are bound to the insights module, not the search module
      mutationType: 'insights/project',
      storePath: 'insights.project',
      // Conditional callbacks
      withFn: () => this.registerWidget({ ...options, name }),
      withoutFn: () => this.unregisterWidget(name)
    })
  }
  /**
   * Replace an existing widget
   * @memberof WidgetsMixin.prototype
   * @param {String} name - Name of the widget to replace
   * @param {Object} options - Widget's options passed to widget constructor.
   * @param {Boolean} options.card - Either or not this widget should be a `card` component from Boostrap
   * @param {Number} options.cols - Number of columns to fill in the grid (from 1 to 12)
   * @param {String} [options.type=WidgetEmpty] - Type of the widget
   * @example
   * datashare.replaceWidget('default-text', {
   *  card: true,
   *  cols: 6,
   *  type: 'WidgetText',
   *  content: "Welcome to my amazing project dashboard!",
   *  title: "Secret Project",
   *  order: "-1"
   * })
   */
  replaceWidget (name, options) {
    // Unregister existing widget
    this.unregisterWidget(name)
    // Register the new one and ensure the "name" of the widget
    // is the same than the one we replace
    this.registerWidget({ ...options, name })
  }
  /**
   * Replace an existing widget for a specific project
   * @memberof WidgetsMixin.prototype
   * @param {String} project - Name of the project to add this widget to
   * @param {String} name - Name of the widget to replace
   * @param {Object} options - Widget's options passed to widget constructor. Each widget class can define its own default values.
   * @param {Boolean} options.card - Either or not this widget should be a `card` component from Boostrap
   * @param {Number} options.cols - Number of columns to fill in the grid (from 1 to 12)
   * @param {String} [options.type=WidgetEmpty] - Type of the widget
   */
  replaceWidgetForProject (project, name, options) {
    // Save the initial option of the existing widget
    const initialOptions = this.store.getters['insights/getWidget']({ name })
    // Watch store mutations
    return this.toggleForProject({
      project,
      // Widgets are bound to the insights module, not the search module
      mutationType: 'insights/project',
      storePath: 'insights.project',
      // Conditional callbacks
      withFn: () => this.replaceWidget(name, options),
      withoutFn: () => this.replaceWidget(name, initialOptions)
    })
  }
}

export default WidgetsMixin
