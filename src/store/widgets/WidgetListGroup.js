import Component from '@/components/widget/WidgetListGroup'
import WidgetEmpty from './WidgetEmpty'

/**
 * Widget to display a list of items or links on the insights page
 */
class WidgetListGroup extends WidgetEmpty {
  /**
   * Create a new WidgetListGroup
   * @param title=null {string} - The title of the widget
   * @param items=[] {Array} - The list of items to display
   * @param pipeline='widget-list-group' {string} - I do not know
   * @param options {Object} - See WidgetEmpty for others options
   */
  constructor({ title = null, items = [], pipeline = 'widget-list-group', ...options }) {
    super(options)
    this.title = title
    this.items = items
    this.pipeline = pipeline
  }
  get component() {
    return Component
  }
}

export default WidgetListGroup
