import WidgetEmpty from './WidgetEmpty'

import Component from '@/components/widget/WidgetFileBarometer'

/**
 * Widget to display the number of indexed files on the insights page
 */
class WidgetFileBarometer extends WidgetEmpty {
  get component() {
    return Component
  }
}

export default WidgetFileBarometer
