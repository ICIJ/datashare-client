import WidgetEmpty from './WidgetEmpty'

import Component from '@/components/Widget/WidgetPaths'

/**
 * Widget to navigate inside the project files and directories.
 */
class WidgetPaths extends WidgetEmpty {
  /**
   * Create a new WidgetPaths
   * @param options {Object} - See WidgetEmpty for others options
   */
  constructor({ ...options }) {
    super(options)
  }

  get component() {
    return Component
  }
}

export default WidgetPaths
