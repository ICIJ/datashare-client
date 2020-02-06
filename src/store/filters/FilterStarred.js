import { get } from 'lodash'
import FilterYesNo from './FilterYesNo'

export const starredLabel = {
  all: 'filter.all',
  true: 'filter.starred',
  false: 'filter.notStarred'
}

export default class FilterStarred extends FilterYesNo {
  constructor (options) {
    super({ ...options, labelFun: item => get(starredLabel, item.key, '') })
  }

  get starredDocuments () {
    return this.state.starredDocuments
  }
}
