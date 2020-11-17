import { identity } from 'lodash'

import Component from '@/components/WidgetTreeMap'
import WidgetEmpty from './WidgetEmpty'

class WidgetTreeMap extends WidgetEmpty {
  constructor ({ title = null, baseDirname = '', getData = identity, getTitle = identity, getSubtitle = identity, ...options }) {
    super(options)
    this.title = title
    this.baseDirname = baseDirname
    this.getData = getData
    this.getTitle = getTitle
    this.getSubtitle = getSubtitle
  }

  get component () {
    return Component
  }
}

export default WidgetTreeMap
