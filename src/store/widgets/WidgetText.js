import Component from '@/components/WidgetText'
import WidgetEmpty from './WidgetEmpty'

const DEFAULT_CONTENT = `Welcome to Datashare Insights! 
                         The smartest way to get insights about your documents in minutes.
                         Each widget can be customized with plugins, depending on your project
                         or your documents.`

class WidgetText extends WidgetEmpty {
  constructor ({ title = null, content = DEFAULT_CONTENT, ...options }) {
    super(options)
    this.title = title
    this.content = content
  }
  get component () {
    return Component
  }
}

export default WidgetText
