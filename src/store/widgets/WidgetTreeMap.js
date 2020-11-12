import { identity } from 'lodash'

import Component from '@/components/WidgetTreeMap'
import WidgetEmpty from './WidgetEmpty'

class WidgetTreeMap extends WidgetEmpty {
  constructor ({ title = null, data = null, transformName = identity, ...options }) {
    super(options)
    this.title = title
    this.data = data
    this.transformName = transformName
  }

  get component () {
    return Component
  }
}

export default WidgetTreeMap
