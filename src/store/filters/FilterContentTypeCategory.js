import { pickBy, toLower } from 'lodash'

import FilterText from './FilterText'

import DisplayContentTypeCategory from '@/components/Display/DisplayContentTypeCategory'
import categories from '@/utils/contentTypeCategories.json'

export const CONTENT_TYPE_CATEGORY_FILTER_NAME = 'contentTypeCategory'

/**
 * Filter on high-level content-type categories (AUDIO, VIDEO, DOCUMENT, ...).
 * Labels are resolved via i18n (`filter.contentTypeCategoryItem.<KEY>`); the JSON
 * payload only carries ordering and icons. This filter is hidden from the
 * filters panel — its values are only exposed in the URL query string and
 * in the breadcrumb.
 */
export default class FilterContentTypeCategory extends FilterText {
  /**
   * Map a search query to matching category keys. Matches on the raw key
   * since filter classes run outside i18n context; the filter is hidden
   * from the panel so this method is rarely exercised.
   * @param {string} query - Lowercased user query.
   * @returns {string[]} Category keys whose key contains the query.
   */
  keyAliases(query) {
    return Object.keys(pickBy(categories, (_value, key) => toLower(key).includes(query)))
  }

  /**
   * Fields the include/exclude clauses match against. Category values are
   * stored uppercase (`IMAGE`), which only matches with a `terms` query on a
   * non-analysed field. Older indices map `contentTypeCategory` as `text` with
   * a `.keyword` sub-field (the raw value lives in the sub-field); newer ones
   * map it directly as `keyword` (the raw value lives on the field itself, with
   * no sub-field). We `should`-combine both so a single query stays correct
   * across the heterogeneous mappings a search may span: the field absent from
   * a given index simply contributes no match there.
   * @override
   * @returns {string[]} `[<key>.keyword, <key>]`.
   */
  get matchFields() {
    return [`${this.key}.keyword`, this.key]
  }

  /**
   * @param {{key: string}} item - Bucket with the category key.
   * @returns {string} i18n key resolved by `labelToHuman` to render the label.
   */
  itemLabel(item) {
    return `filter.contentTypeCategoryItem.${item.key}`
  }

  /** @returns {object} Display component used to render selected values. */
  static get display() {
    return DisplayContentTypeCategory
  }
}
