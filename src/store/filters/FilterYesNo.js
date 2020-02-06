import FilterText from './FilterText'

export default class FilterYesNo extends FilterText {
  constructor (...args) {
    super(...args)
    this.component = 'FilterYesNo'
  }

  addChildIncludeFilter (body, param) {
    if (param.values[0]) {
      return body.addFilter('terms', this.key, this.starredDocuments)
    } else {
      return body.notFilter('terms', this.key, this.starredDocuments)
    }
  }
}
