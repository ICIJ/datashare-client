import get from 'lodash/get'
import FilterYesNo from './FilterYesNo'

export const starredLabel = {
  all: 'filter.all',
  true: 'filter.starred',
  false: 'filter.notStarred'
}

export default class FilterStarred extends FilterYesNo {
  itemLabel (item) {
    return get(starredLabel, item.key, '')
  }
  get starredDocuments () {
    return this.state.starredDocuments
  }
}
