import FilterText from './FilterText'

export default class FilterRecommendedBy extends FilterText {
  constructor (options) {
    super(options)
    this.component = 'FilterRecommendedBy'
  }

  addChildIncludeFilter (body) {
    return body.addFilter('terms', this.key, this.state.documentsRecommended)
  }

  addChildExcludeFilter (body) {
    return body.notFilter('terms', this.key, this.state.documentsRecommended)
  }
}
