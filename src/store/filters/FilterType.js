import FilterText from './FilterText'

/**
 * Filter that builds bool-query include/exclude clauses via `queryBuilder`.
 * Default base for filters that need richer query construction than plain
 * `terms` matching.
 */
export default class FilterType extends FilterText {
  constructor(...args) {
    super(...args)
    this.component = 'FilterType'
  }

  /**
   * Delegate to `queryBuilder` as an `orQuery` for inclusive matching.
   * @param {object} body - Bodybuilder instance.
   * @param {{values: string[]}} param - Current selection.
   * @returns {object} The mutated body.
   */
  addChildIncludeFilter(body, param) {
    return this.queryBuilder(body, param, 'orQuery')
  }

  /**
   * Delegate to `queryBuilder` as a `notQuery` for exclusive matching.
   * @param {object} body - Bodybuilder instance.
   * @param {{values: string[]}} param - Current selection.
   * @returns {object} The mutated body.
   */
  addChildExcludeFilter(body, param) {
    return this.queryBuilder(body, param, 'notQuery')
  }
}
