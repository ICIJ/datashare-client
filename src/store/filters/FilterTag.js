import FilterText from './FilterText'

import DisplayTags from '@/components/Display/DisplayTags'

export default class FilterTag extends FilterText {
  static get display() {
    return DisplayTags
  }
}
