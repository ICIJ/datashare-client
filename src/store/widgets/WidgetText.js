import Component from '@/components/WidgetText'
import WidgetEmpty from './WidgetEmpty'

class WidgetText extends WidgetEmpty {
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
