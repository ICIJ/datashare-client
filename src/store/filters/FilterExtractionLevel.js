import get from 'lodash/get'

import FilterText from './FilterText'

import DisplayExtractionLevel from '@/components/Display/DisplayExtractionLevel'
import { getExtractionLevelTranslationKey } from '@/utils/utils'

/**
 * Filter by extraction depth (root document, first-level attachment, etc.).
 * Sorts by bucket key ascending by default so levels appear in natural order.
 */
export default class FilterExtractionLevel extends FilterText {
  /**
   * @param {{key: number}} item - Bucket whose key is the extraction level.
   * @returns {string} Translation key for the level label.
   */
  itemLabel(item) {
    return getExtractionLevelTranslationKey(item.key)
  }

  /** @returns {string} Sort field, defaulting to `_key` for natural order. */
  get sortBy() {
    return get(this, ['state', 'sortFilters', this.name, 'sortBy'], '_key')
  }

  /** @returns {string} Sort direction, defaulting to `asc`. */
  get orderBy() {
    return get(this, ['state', 'sortFilters', this.name, 'orderBy'], 'asc')
  }

  /** @returns {object} Display component used to render selected values. */
  static get display() {
    return DisplayExtractionLevel
  }
}
