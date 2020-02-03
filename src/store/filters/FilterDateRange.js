import max from 'lodash/max'
import min from 'lodash/min'
import FilterDate from './FilterDate'

export default class FilterDateRange extends FilterDate {
  constructor (name, key, icon, isSearchable, labelFun) {
    super(name, key, icon, isSearchable, labelFun)
    this.component = 'FacetDateRange'
  }
  queryBuilder (body, param, func) {
    return body.query('bool', sub => {
      sub[func]('range', this.key, { gte: new Date(min(param.values)), lte: new Date(max(param.values)) })
      return sub
    })
  }
}
