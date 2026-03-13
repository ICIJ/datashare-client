import { map, toLower } from 'lodash'

import FilterText from './FilterText'

import DisplayContentType from '@/components/Display/DisplayContentType'
import types from '@/utils/contentTypes.json'
import { getDocumentTypeLabel } from '@/utils/utils'

/**
 * Filter on MIME `contentType`. Resolves human-readable labels via the
 * `contentTypes.json` map and lets users search by either the MIME key
 * or the translated label.
 */
export default class FilterContentType extends FilterText {
  constructor(options) {
    super(options)
    this.component = 'FilterTypeFileTypes'
  }

  /**
   * Map a label-based search query to matching MIME keys.
   * @param {string} query - Lowercased user query.
   * @returns {string[]} MIME keys whose label contains the query (may include `undefined`).
   */
  keyAliases(query) {
    return map(types, (item, key) => {
      if (toLower(item.label).includes(query)) {
        return key
      }
    })
  }

  /**
   * @param {{key: string}} item - Bucket with the MIME key.
   * @returns {string} Translation key for the MIME type label.
   */
  itemLabel(item) {
    return getDocumentTypeLabel(item.key)
  }

  /** @returns {object} Display component used to render selected values. */
  static get display() {
    return DisplayContentType
  }
}
