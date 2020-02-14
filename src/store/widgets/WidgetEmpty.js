import uniqueId from 'lodash/uniqueId'
import Component from '@/components/WidgetEmpty'

const _STATE = typeof Symbol === 'function' ? Symbol('_state') : '_state'

class WidgetEmpty {
  constructor ({ name = uniqueId('widget-'), card = true, cols = 12 } = { }) {
    this.name = name
    this.card = card
    this.cols = cols
  }
  bindState (state) {
    this[_STATE] = this[_STATE] || state
  }
  get state () {
    return this[_STATE]
  }
  get component () {
    return Component
  }
}

export default WidgetEmpty
