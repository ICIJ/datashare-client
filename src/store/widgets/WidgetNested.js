import { defineAsyncComponent } from 'vue'
import castArray from 'lodash/castArray'
import WidgetEmpty from './WidgetEmpty'

// See WidgetEmpty.js for why this is lazy.
const Component = defineAsyncComponent(() => import('@/components/Widget/WidgetNested'))

/**
 * Widget to display nested widgets
 */
class WidgetNested extends WidgetEmpty {
  /**
   * Create a new WidgetNested
   * @param widgets {Array} - A list of nested widgets
   * @param options {Object} - See WidgetEmpty for others options
   */
  constructor({ widgets = [], ...options } = {}) {
    super(options)
    this.widgets = castArray(widgets)
  }

  get component() {
    return Component
  }
}

export default WidgetNested
