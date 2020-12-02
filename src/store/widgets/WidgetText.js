import Component from '@/components/WidgetText'
import WidgetEmpty from './WidgetEmpty'

/**
 * Widget to display text on the insights page
 */
class WidgetText extends WidgetEmpty {
  /**
   * Create a new WidgetText based on a WidgetEmpty
   * @param title=null {string} - The title of the widget
   * @param content=null {string} - The content of the widget
   * @param pipeline='widget-text' {string} - Transformation to apply to the content
   * @param options {Object} - See WidgetEmpty for others options
   */
  constructor ({ title = null, content = null, pipeline = 'widget-text', ...options }) {
    super(options)
    this.title = title
    this.content = content
    this.pipeline = pipeline
  }

  get component () {
    return Component
  }
}

export default WidgetText
