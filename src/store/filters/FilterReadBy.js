import FilterText from './FilterText'

export default class FilterReadBy extends FilterText {
  constructor (options) {
    super(options)
    this.component = 'FilterReadBy'
  }

  addChildIncludeFilter (body, param) {
    return body.addFilter('terms', this.key, this.state.documentsRead)
  }
}
