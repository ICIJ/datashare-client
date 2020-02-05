import FilterType from './FilterType'

export default class FilterDocument extends FilterType {
  constructor (name, key, icon, isSearchable, labelFun) {
    super(name, key, icon, isSearchable, labelFun)
    this.component = 'FilterDocument'
  }

  addParentIncludeFilter (body, param) {
    return body.query('has_parent', { 'parent_type': 'Document' }, q => this.addChildIncludeFilter(q, param))
  }
}
