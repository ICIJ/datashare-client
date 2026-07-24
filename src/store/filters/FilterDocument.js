import FilterType from './FilterType'

/**
 * Filter whose include clause wraps the child filter in a `has_parent`
 * query so it resolves against the parent `Document`.
 */
export default class FilterDocument extends FilterType {
  constructor(options) {
    super(options)
    this.component = 'FilterTypeDocument'
  }

  /**
   * Wrap the child include filter in `has_parent` so it resolves on the Document.
   * @param {object} body - Bodybuilder instance.
   * @param {{values: string[]}} param - Current selection.
   * @returns {object} The mutated body.
   */
  addParentIncludeFilter(body, param) {
    return body.query('has_parent', { parent_type: 'Document' }, q => this.addChildIncludeFilter(q, param))
  }
}
