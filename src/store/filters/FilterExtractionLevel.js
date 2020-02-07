import FilterText from './FilterText'
import { getExtractionLevelTranslationKey } from '@/utils/utils'

export default class FilterExtractionLevel extends FilterText {
  itemLabel (item) {
    return getExtractionLevelTranslationKey(item.key)
  }
}
