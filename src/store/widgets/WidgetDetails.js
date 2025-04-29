import WidgetEmpty from './WidgetEmpty'

import Component from '@/components/Widget/WidgetDetails'

/**
 * Widget to display a project's details
 */
class WidgetDetails extends WidgetEmpty {
  get component() {
    return Component
  }
}

export default WidgetDetails
