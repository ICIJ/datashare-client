import { defineAsyncComponent } from 'vue'
import WidgetEmpty from './WidgetEmpty'

// See WidgetEmpty.js for why this is lazy.
const Component = defineAsyncComponent(() => import('@/components/Widget/WidgetRecommendedBy'))

/**
 * Widget to display latest recommend documents.
 */
class WidgetRecommendedBy extends WidgetEmpty {
  /**
   * Create a new WidgetRecommendedBy
   * @param hideThumbnails {Boolean} - Etheir or not we should hide thumbnails
   * @param options {Object} - See WidgetEmpty for others options
   */
  constructor({ hideThumbnails = false, ...options } = {}) {
    super(options)
    this.hideThumbnails = !!hideThumbnails
  }

  get component() {
    return Component
  }
}

export default WidgetRecommendedBy
