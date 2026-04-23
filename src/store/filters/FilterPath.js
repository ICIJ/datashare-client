import compact from 'lodash/compact'
import trimEnd from 'lodash/trimEnd'
import uniq from 'lodash/uniq'

import FilterDocument from './FilterDocument'

/**
 * Filter by directory path using the `dirname.tree` prefix tokenizer.
 * Matches both the original and lowercased forms for retro-compatibility
 * with indices predating the 9.4.2 lowercase analyzer change.
 */
export default class FilterPath extends FilterDocument {
  constructor(options) {
    super(options)
    this.prefix = true
    this.component = 'FilterTypePath'
  }

  /**
   * Match each selected path against the `dirname.tree` prefix tokens.
   * @param {object} body - Bodybuilder instance.
   * @param {{values: string[]}} param - Selected directory paths.
   * @param {string} func - Bodybuilder chain method (`query` or `notQuery`).
   * @returns {object} The mutated body.
   */
  queryBuilder(body, param, func) {
    return body.query('bool', (sub) => {
      compact(param.values).forEach((dirname) => {
        /**
         * @deprecated Since 9.4.2, the dirname field is tokenized using the
         * "lowercase" filter. To ensure retro-compatibility, we apply the
         * filter using both lowercase and orignal value for this field (if they
         * are different).
         */
        uniq([dirname, dirname.toLowerCase()]).forEach((token) => {
          sub[func]('term', 'dirname.tree', trimEnd(token, '/'))
        })
      })
      return sub
    })
  }
}
