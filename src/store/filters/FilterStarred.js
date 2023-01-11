import { get, map } from 'lodash'
import FilterText from './FilterText'

export default class FilterStarred extends FilterText {
  constructor(options) {
    super(options)
    this.component = 'FilterStarred'
  }
  addChildIncludeFilter(body, param) {
    if (param.values[0]) {
      return body.addFilter('terms', this.key, this.starredDocumentIds)
    } else {
      return body.notFilter('terms', this.key, this.starredDocumentIds)
    }
  }
  itemLabel(item) {
    return get(FilterStarred.starredLabels, item.key, item.key)
  }
  get starredDocuments() {
    return this.rootState.starred.documents
  }
  get starredDocumentIds() {
    return map(this.starredDocuments, 'id')
  }
  static get starredLabels() {
    return {
      all: 'global.all',
      true: 'filter.starred',
      false: 'filter.notStarred'
    }
  }
}
