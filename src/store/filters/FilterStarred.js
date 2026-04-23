import { get, map } from 'lodash'

import FilterText from './FilterText'

import DisplayStarred from '@/components/Display/DisplayStarred'
import { useStarredStore } from '@/store/modules'

/**
 * Boolean filter toggling between starred and not-starred documents.
 * Resolves the starred document ids from the starred store at query time.
 */
export default class FilterStarred extends FilterText {
  constructor(options) {
    super(options)
    this.component = 'FilterTypeStarred'
  }

  /**
   * Include starred, excluded starred, or leave the body untouched when both
   * options are selected.
   * @param {object} body - Bodybuilder instance.
   * @param {{values: (boolean|string)[]}} selection - Selected toggle values.
   * @returns {object} The (possibly) mutated body.
   */
  addChildIncludeFilter(body, { values }) {
    const hasBool = bool => values.includes(bool) || values.includes(bool.toString())

    if (hasBool(true) && hasBool(false)) {
      return body
    }

    if (hasBool(true)) {
      return body.addFilter('terms', this.key, this.starredDocumentIds)
    }

    if (hasBool(false)) {
      return body.notFilter('terms', this.key, this.starredDocumentIds)
    }

    return body
  }

  /**
   * @param {{key: (boolean|string)}} item - Bucket whose key is `true` or `false`.
   * @returns {string} Translation key for the starred/not-starred label.
   */
  itemLabel(item) {
    return get(FilterStarred.starredLabels, item.key, item.key)
  }

  /** @returns {object[]} Starred documents from the starred store. */
  get starredDocuments() {
    return useStarredStore().documents
  }

  /** @returns {string[]} Ids of the currently starred documents. */
  get starredDocumentIds() {
    return map(this.starredDocuments, 'id')
  }

  /** @returns {{true: string, false: string}} Translation keys for each boolean option. */
  static get starredLabels() {
    return {
      true: 'filter.starred',
      false: 'filter.notStarred'
    }
  }

  /** @returns {object} Display component used to render selected values. */
  static get display() {
    return DisplayStarred
  }
}
