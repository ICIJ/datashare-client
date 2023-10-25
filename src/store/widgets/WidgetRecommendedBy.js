import WidgetEmpty from './WidgetEmpty'

import Component from '@/components/widget/WidgetRecommendedBy'

/**
 * Widget to display latest recommend documents.
 */
class WidgetNames extends WidgetEmpty {
  get component() {
    return Component
  }
}

export default WidgetNames
