import FilterYesNo from './FilterYesNo'

export default class FilterStarred extends FilterYesNo {
  get starredDocuments () {
    return this.state.starredDocuments
  }
}
