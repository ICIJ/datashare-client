import WidgetEmpty from './WidgetEmpty'

import Component from '@/components/Widget/WidgetEntities'

/**
 * Widget to display text on the insights page
 */
class WidgetEntities extends WidgetEmpty {
  get component() {
    return Component
  }
}

export default WidgetEntities
