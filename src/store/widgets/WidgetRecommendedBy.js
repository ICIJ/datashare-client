import WidgetEmpty from './WidgetEmpty'

import Component from '@/components/Widget/WidgetRecommendedBy'

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
