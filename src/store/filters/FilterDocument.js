import FilterType from './FilterType'

export default class FilterDocument extends FilterType {
  constructor(options) {
    super(options)
    this.component = 'FilterTypeDocument'
  }

  addParentIncludeFilter(body, param) {
    return body.query('has_parent', { parent_type: 'Document' }, q => this.addChildIncludeFilter(q, param))
  }
}
