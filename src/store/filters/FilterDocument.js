import FacetType from './FilterType'

export default class FacetDocument extends FacetType {
  constructor (name, key, icon, isSearchable, labelFun) {
    super(name, key, icon, isSearchable, labelFun)
    this.component = 'FacetDocument'
  }

  addParentIncludeFilter (body, param) {
    return body.query('has_parent', { 'parent_type': 'Document' }, q => this.addChildIncludeFilter(q, param))
  }
}
