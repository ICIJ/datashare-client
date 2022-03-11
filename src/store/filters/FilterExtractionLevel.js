import FilterText from './FilterText'
import { getExtractionLevelTranslationKey } from '@/utils/utils'

export default class FilterExtractionLevel extends FilterText {
  constructor (options) {
    super(options)
    this.sort = '_key'
    this.sortByOrder = 'asc'
  }
  itemLabel (item) {
    return getExtractionLevelTranslationKey(item.key)
  }
}
