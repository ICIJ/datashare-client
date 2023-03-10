import get from 'lodash/get'

import FilterText from './FilterText'

import { getExtractionLevelTranslationKey } from '@/utils/utils'

export default class FilterExtractionLevel extends FilterText {
  itemLabel(item) {
    return getExtractionLevelTranslationKey(item.key)
  }

  get sortBy() {
    return get(this, ['state', 'sortedFilters', this.name, 'sortBy'], '_key')
  }

  get sortByOrder() {
    return get(this, ['state', 'sortedFilters', this.name, 'sortByOrder'], 'asc')
  }
}
