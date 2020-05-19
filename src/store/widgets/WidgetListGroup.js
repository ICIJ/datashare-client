import Component from '@/components/WidgetListGroup'
import WidgetEmpty from './WidgetEmpty'

class WidgetListGroup extends WidgetEmpty {
  constructor ({ title = null, items = [], pipeline = 'widget-list-group', ...options }) {
    super(options)
    this.title = title
    this.items = items
    this.pipeline = pipeline
  }
  get component () {
    return Component
  }
}

export default WidgetListGroup
