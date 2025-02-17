import { get, map } from 'lodash'

import FilterText from './FilterText'

import DisplayBoolean from '@/components/Display/DisplayBoolean'
import { useStarredStore } from '@/store/modules/starred'

export default class FilterStarred extends FilterText {
  constructor(options) {
    super(options)
    this.component = 'FilterTypeStarred'
  }
  addChildIncludeFilter(body, { values }) {
    if (values[0]) {
      return body.addFilter('terms', this.key, this.starredDocumentIds)
    }

    return body.notFilter('terms', this.key, this.starredDocumentIds)
  }
  itemLabel(item) {
    return get(FilterStarred.starredLabels, item.key, item.key)
  }
  get starredDocuments() {
    return useStarredStore().documents
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
  static get display() {
    return DisplayBoolean
  }
}
