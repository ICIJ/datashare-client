import { defineAsyncComponent } from 'vue'
import WidgetEmpty from './WidgetEmpty'

// See WidgetEmpty.js for why this is lazy.
const Component = defineAsyncComponent(() => import('@/components/Widget/WidgetDocuments'))

/**
 * Widget to display the number of indexed files on the insights page
 */
class WidgetDocuments extends WidgetEmpty {
  get component() {
    return Component
  }
}

export default WidgetDocuments
