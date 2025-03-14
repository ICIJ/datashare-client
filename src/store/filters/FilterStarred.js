import { get, map } from 'lodash'

import FilterText from './FilterText'

import DisplayStarred from '@/components/Display/DisplayStarred'
import { useStarredStore } from '@/store/modules'

export default class FilterStarred extends FilterText {
  constructor(options) {
    super(options)
    this.component = 'FilterTypeStarred'
  }
  addChildIncludeFilter(body, { values }) {
    const hasBool = (bool) => values.includes(bool) || values.includes(bool.toString())

    if (hasBool(true) && hasBool(false)) {
      return body
    }

    if (hasBool(true)) {
      return body.addFilter('terms', this.key, this.starredDocumentIds)
    }

    if (hasBool(false)) {
      return body.notFilter('terms', this.key, this.starredDocumentIds)
    }

    return body
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
      true: 'filter.starred',
      false: 'filter.notStarred'
    }
  }
  static get display() {
    return DisplayStarred
  }
}
