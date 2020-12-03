import uniqueId from 'lodash/uniqueId'
import Component from '@/components/widget/WidgetEmpty'

const _STATE = typeof Symbol === 'function' ? Symbol('_state') : '_state'

/**
 * Class representing the Empty widget. This widget is not intended to be used directly.
 */
class WidgetEmpty {
  /**
   * Create a new WidgetEmpty
   * @param name {string} - Unique name of the widget
   * @param card=true {boolean} - Is this widget displayed as [card](https://bootstrap-vue.org/docs/components/card) ?
   * @param cols=12 {number} - Number of columns on which the widget should be displayed according to the
   * [Bootstrap's grid system](https://bootstrap-vue.org/docs/components/layout#layout-and-grid-system)
   * @param order=0 {number} - Order to display among the others widgets
   */
  constructor ({ name = uniqueId('widget-'), card = true, cols = 12, order = 0 } = { }) {
    this.name = name
    this.card = card
    this.cols = cols
    this.order = order
  }
  bindState (state) {
    this[_STATE] = this[_STATE] || state
  }
  get state () {
    return this[_STATE]
  }
  get component () {
    return Component
  }
}

export default WidgetEmpty
