import Component from '@/components/widget/WidgetDiskUsage'
import WidgetEmpty from './WidgetEmpty'

/**
 * Widget to display the disk space occupied by indexed files on the insights page.
 */
class WidgetDiskUsage extends WidgetEmpty {
  get component () {
    return Component
  }
}

export default WidgetDiskUsage
