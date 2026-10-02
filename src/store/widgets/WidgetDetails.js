import { defineAsyncComponent } from 'vue'
import WidgetEmpty from './WidgetEmpty'

// See WidgetEmpty.js for why this is lazy.
const Component = defineAsyncComponent(() => import('@/components/Widget/WidgetDetails'))

/**
 * Widget to display a project's details
 */
class WidgetDetails extends WidgetEmpty {
  get component() {
    return Component
  }
}

export default WidgetDetails
