import { isInteger, max, min } from 'lodash'
import moment from 'moment'
import FilterDate from './FilterDate'

export default class FilterDateRange extends FilterDate {
  constructor (options) {
    super(options)
    this.component = 'FilterDateRange'
  }
  itemLabel (item) {
    if (isInteger(item.key)) {
      const timestamp = item.key + new Date().getTimezoneOffset() * 60 * 1000
      return moment(timestamp).locale(localStorage.getItem('locale')).format('L')
    } else {
      return item.key
    }
  }
  queryBuilder (body, param, func) {
    return body.query('bool', sub => {
      sub[func]('range', this.key, { gte: new Date(min(param.values)), lte: new Date(max(param.values)) })
      return sub
    })
  }
}
