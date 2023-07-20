import WidgetEmpty from './WidgetEmpty'

import Component from '@/components/widget/WidgetNames'

/**
 * Widget to display names
 */
class WidgetNames extends WidgetEmpty {
  get component() {
    return Component
  }
}

export default WidgetNames
