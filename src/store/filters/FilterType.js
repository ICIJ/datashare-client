import FilterText from './FilterText'

export default class FilterType extends FilterText {
  constructor (...args) {
    super(...args)
    this.component = 'FilterType'
  }

  addChildIncludeFilter (body, param, func) {
    return this.queryBuilder(body, param, 'orQuery')
  }

  addChildExcludeFilter (body, param, func) {
    return this.queryBuilder(body, param, 'notQuery')
  }
}
