import uniqueId from 'lodash/uniqueId'

import Component from '@/components/Widget/WidgetEmpty'

/**
 * Class representing the Empty widget. This widget is not intended to be used directly.
 */
class WidgetEmpty {
  /**
   * Create a new WidgetEmpty
   * @param name {string} - Unique name of the widget
   * @param card=true {boolean} - Is this widget displayed as [card](https://bootstrap-vue.org/docs/components/card) ?
   * @param cols=12 {number} - Number of columns on which the widget should be displayed (up to the `xl` breakpoint)
   * according to the [Bootstrap's grid system](https://bootstrap-vue.org/docs/components/layout#layout-and-grid-system)
   * @param colsXxl=null {number|null} - Number of columns to use at the `xxl` breakpoint (≥1400px). Falls back to
   * `cols` when null. Lets a few wide widgets share a row only on large screens while stacking on smaller ones.
   * @param order=0 {number} - Order to display among the others widgets
   */
  constructor({ name = uniqueId('widget-'), card = true, cols = 12, colsXxl = null, order = 0, modes = null, section = null } = {}) {
    this.name = name
    this.card = card
    this.cols = cols
    this.colsXxl = colsXxl
    this.order = order
    this.modes = modes
    this.section = section
  }

  get component() {
    return Component
  }
}

export default WidgetEmpty
