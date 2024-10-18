import get from 'lodash/get'

import FilterText from './FilterText'

import DisplayExtractionLevel from '@/components/Display/DisplayExtractionLevel'
import { getExtractionLevelTranslationKey } from '@/utils/utils'

export default class FilterExtractionLevel extends FilterText {
  itemLabel(item) {
    return getExtractionLevelTranslationKey(item.key)
  }

  get sortBy() {
    return get(this, ['state', 'sortFilters', this.name, 'sortBy'], '_key')
  }

  get orderBy() {
    return get(this, ['state', 'sortFilters', this.name, 'orderBy'], 'asc')
  }

  static get display() {
    return DisplayExtractionLevel
  }
}
