import WidgetEmpty from './WidgetEmpty'

import Component from '@/components/Widget/WidgetDocuments'

/**
 * Widget to display the number of indexed files on the insights page
 */
class WidgetDocuments extends WidgetEmpty {
  get component() {
    return Component
  }
}

export default WidgetDocuments
