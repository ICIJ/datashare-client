import FilterText from './FilterText'

export default class FilterYesNo extends FilterText {
  constructor (name, key, icon, isSearchable, labelFun) {
    super(name, key, icon, isSearchable, labelFun)
    this.component = 'FacetYesNo'
    this.starredDocuments = []
  }

  addChildIncludeFilter (body, param) {
    if (param.values[0]) {
      return body.addFilter('terms', this.key, this.starredDocuments)
    } else {
      return body.notFilter('terms', this.key, this.starredDocuments)
    }
  }
}
