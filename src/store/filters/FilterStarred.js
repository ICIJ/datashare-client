import get from 'lodash/get'
import FilterText from './FilterText'

export default class FilterStarred extends FilterText {
  constructor (options) {
    super(options)
    this.component = 'FilterYesNo'
  }
  addChildIncludeFilter (body, param) {
    if (param.values[0]) {
      return body.addFilter('terms', this.key, this.starredDocuments)
    } else {
      return body.notFilter('terms', this.key, this.starredDocuments)
    }
  }
  itemLabel (item) {
    return get(FilterStarred.starredLabels, item.key, item.key)
  }
  get starredDocuments () {
    return this.rootState.starred.documents
  }
  static get starredLabels () {
    return {
      all: 'global.all',
      true: 'filter.starred',
      false: 'filter.notStarred'
    }
  }
}
