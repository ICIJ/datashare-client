import Component from '@/components/WidgetTreeMap'
import WidgetEmpty from './WidgetEmpty'

class WidgetTreeMap extends WidgetEmpty {
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
