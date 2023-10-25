import { castArray } from 'lodash'

import WidgetEmpty from './WidgetEmpty'

import Component from '@/components/widget/WidgetNested'

/**
 * Widget to display nested widgets
 */
class WidgetNested extends WidgetEmpty {
  /**
   * Create a new WidgetProject
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
