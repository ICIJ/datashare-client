import Component from '@/components/WidgetText'
import WidgetEmpty from './WidgetEmpty'

class WidgetText extends WidgetEmpty {
  constructor ({ title = null, content = null, ...options }) {
    super(options)
    this.title = title
    this.content = content
  }
  get component () {
    return Component
  }
}

export default WidgetText
