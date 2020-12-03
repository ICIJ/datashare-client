import Component from '@/components/widget/WidgetTreeMap'
import WidgetEmpty from './WidgetEmpty'

/**
 * Class representing the TreeMap widget
 */
class WidgetTreeMap extends WidgetEmpty {
  /**
   * Create a new WidgetTreeMap based on a WidgetEmpty
   * @param title=null {string} - The title of the Widget
   * @param index {string} - The Elasticsearch project of the Widget
   * @param options {Object} - See WidgetEmpty for others options
   */
  constructor ({
    title = null,
    index = '',
    ...options
  }) {
    super(options)
    this.title = title
    this.index = index
  }

  get component () {
    return Component
  }
}

export default WidgetTreeMap
