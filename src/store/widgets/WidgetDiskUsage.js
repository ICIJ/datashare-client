import WidgetEmpty from './WidgetEmpty'

import Component from '@/components/widget/WidgetDiskUsage'

/**
 * Widget to display the disk space occupied by indexed files on the insights page.
 */
class WidgetDiskUsage extends WidgetEmpty {
  get component() {
    return Component
  }
}

export default WidgetDiskUsage
