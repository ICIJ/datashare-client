import FilterText from './FilterText'

export default class FilterRecommendedBy extends FilterText {
  constructor (options) {
    super(options)
    this.component = 'FilterRecommendedBy'
  }

  addChildIncludeFilter (body, param) {
    return body.addFilter('terms', this.key, this.state.documentsRecommended)
  }

  addChildExcludeFilter (body, param) {
    return body.notFilter('terms', this.key, this.state.documentsRecommended)
  }
}
