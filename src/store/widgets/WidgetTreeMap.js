import { identity } from 'lodash'

import Component from '@/components/WidgetTreeMap'
import WidgetEmpty from './WidgetEmpty'

class WidgetTreeMap extends WidgetEmpty {
  constructor ({ title = null, getData = identity, getTitle = identity, getSubtitle = identity, ...options }) {
    super(options)
    this.title = title
    this.getData = getData
    this.getTitle = getTitle
    this.getSubtitle = getSubtitle
  }

  get component () {
    return Component
  }
}

export default WidgetTreeMap
