import { defineAsyncComponent } from 'vue'
import WidgetEmpty from './WidgetEmpty'

// See WidgetEmpty.js for why this is lazy.
const Component = defineAsyncComponent(() => import('@/components/Widget/WidgetDiskUsage'))

/**
 * Widget to display the disk space occupied by indexed files on the insights page.
 */
class WidgetDiskUsage extends WidgetEmpty {
  get component() {
    return Component
  }
}

export default WidgetDiskUsage
