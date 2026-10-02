import { defineAsyncComponent } from 'vue'
import WidgetEmpty from './WidgetEmpty'

// See WidgetEmpty.js for why this is lazy.
const Component = defineAsyncComponent(() => import('@/components/Widget/WidgetEntities'))

/**
 * Widget to display text on the insights page
 */
class WidgetEntities extends WidgetEmpty {
  get component() {
    return Component
  }
}

export default WidgetEntities
