import WidgetEmpty from './WidgetEmpty'

import Component from '@/components/Widget/WidgetProject'

/**
 * Widget to to display a search bar
 */
class WidgetProject extends WidgetEmpty {
  /**
   * Create a new WidgetProject
   * @param options {Object} - See WidgetEmpty for others options
   */
  constructor({ ...options }) {
    super(options)
  }

  get component() {
    return Component
  }
}

export default WidgetProject
