import Component from '@/components/WidgetTreeMap'
import WidgetEmpty from './WidgetEmpty'

class WidgetTreeMap extends WidgetEmpty {
  constructor ({ title = null, data = null, ...options }) {
    super(options)
    this.title = title
    this.data = data
  }

  get component () {
    return Component
  }
}

export default WidgetTreeMap
