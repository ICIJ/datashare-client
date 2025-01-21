import FilterText from './FilterText'

import DisplayProject from '@/components/Display/DisplayProject'

export default class FilterProject extends FilterText {
  constructor(options) {
    super(options)
    this.component = 'FilterTypeProject'
  }

  static get display() {
    return DisplayProject
  }
}
