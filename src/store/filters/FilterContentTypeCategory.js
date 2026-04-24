import { map, toLower } from 'lodash'

import FilterText from './FilterText'

import DisplayContentTypeCategory from '@/components/Display/DisplayContentTypeCategory'
import categories from '@/utils/contentTypeCategories.json'

/**
 * Filter on high-level content-type categories (AUDIO, VIDEO, DOCUMENT, ...).
 * Resolves human-readable labels via `contentTypeCategories.json`. This filter
 * is hidden from the filters panel — its values are only exposed in the URL
 * query string and in the breadcrumb.
 */
export default class FilterContentTypeCategory extends FilterText {
  /**
   * Map a label-based search query to matching category keys.
   * @param {string} query - Lowercased user query.
   * @returns {string[]} Category keys whose label contains the query.
   */
  keyAliases(query) {
    return map(categories, (item, key) => {
      if (toLower(item.label).includes(query)) {
        return key
      }
    })
  }

  /**
   * @param {{key: string}} item - Bucket with the category key.
   * @returns {string} Human-readable label for the category.
   */
  itemLabel(item) {
    return categories[item.key]?.label ?? item.key
  }

  /** @returns {object} Display component used to render selected values. */
  static get display() {
    return DisplayContentTypeCategory
  }
}
