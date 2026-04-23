import escapeRegExp from 'lodash/escapeRegExp'

import FilterText from './FilterText'

import DisplayLanguage from '@/components/Display/DisplayLanguage'

/**
 * Filter on the document `language` field. Accepts a user-entered search
 * in any case and matches it against uppercase ISO language codes.
 */
export default class FilterLanguage extends FilterText {
  /**
   * Translate the user query into an uppercase regex-escaped token so it
   * can match ISO language codes regardless of input casing.
   * @param {string} query - Raw user query.
   * @returns {string[]} Single-item array with the escaped uppercase query.
   */
  keyAliases(query) {
    return [escapeRegExp(query.toUpperCase())]
  }

  /**
   * @param {{key: string}} item - Bucket whose key is an ISO language code.
   * @returns {string} Translation key for the language label.
   */
  itemLabel(item) {
    return `filter.lang.${item.key}`
  }

  /** @returns {object} Display component used to render selected values. */
  static get display() {
    return DisplayLanguage
  }
}
