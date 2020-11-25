import get from 'lodash/get'

import FilterYesNo from './FilterYesNo'

export default class FilterStarred extends FilterYesNo {
  itemLabel (item) {
    return get(FilterStarred.starredLabels, item.key, item.key)
  }
  get starredDocuments () {
    return this.state.starredDocuments
  }
  static get starredLabels () {
    return {
      all: 'global.all',
      true: 'filter.starred',
      false: 'filter.notStarred'
    }
  }
}
