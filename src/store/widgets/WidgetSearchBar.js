import { defineAsyncComponent } from 'vue'
import WidgetEmpty from './WidgetEmpty'

// See WidgetEmpty.js for why this is lazy.
const Component = defineAsyncComponent(() => import('@/components/Widget/WidgetSearchBar'))

/**
 * Widget to to display a search bar
 */
class WidgetSearchBar extends WidgetEmpty {
  /**
   * Create a new WidgetSearchBar
   * @param index {string} - The Elasticsearch project of the Widget
   * @param options {Object} - See WidgetEmpty for others options
   */
  constructor({ index = '', ...options }) {
    super(options)
    this.index = index
  }

  get component() {
    return Component
  }
}

export default WidgetSearchBar
