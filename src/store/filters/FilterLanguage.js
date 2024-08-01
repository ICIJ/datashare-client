import FilterText from './FilterText'

import DisplayLanguage from '@/components/Display/DisplayLanguage'

export default class FilterLanguage extends FilterText {
  itemLabel(item) {
    return `filter.lang.${item.key}`
  }
  static get display() {
    return DisplayLanguage
  }
}
