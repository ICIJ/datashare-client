import { isInteger, max, min, uniq } from 'lodash'
import moment from 'moment'

import FilterDate from './FilterDate'

export default class FilterDateRange extends FilterDate {
  constructor(options) {
    super(options)
    this.component = 'FilterDateRange'
    this.interval = 'year'
  }

  itemLabel(item) {
    if (isInteger(item.key)) {
      const timestamp = item.key + new Date().getTimezoneOffset() * 60 * 1000
      return moment(timestamp).locale(localStorage.getItem('locale')).format('L')
    } else {
      return item.key
    }
  }

  queryBuilder(body, param, func) {
    return body.query('bool', (sub) => {
      sub[func]('range', this.key, { gte: new Date(min(param.values)), lte: new Date(max(param.values)) })
      return sub
    })
  }

  body(body, { size = 0, interval = this.interval } = {}) {
    return body
      .query('match', 'type', 'Document')
      .agg('date_histogram', this.key, FilterDateRange.getHistogramAgg(interval), this.key, (a) => {
        return a.agg('bucket_sort', { size }, 'bucket_sort_truncate')
      })
  }

  static getHistogramAgg(interval = this.interval) {
    return {
      ...FilterDate.getIntervalOptions(interval),
      min_doc_count: 1,
      order: {
        _key: 'desc'
      }
    }
  }

  static getIntervalOptions(interval = this.interval) {
    switch (interval) {
      case 'day':
        return { interval: '1d', format: 'yyyy-MM-dd', missing: '1970-01-01' }
      case 'month':
        return { interval: '1M', format: 'yyyy-MM', missing: '1970-01' }
      case 'year':
        return { interval: '1y', format: 'yyyy', missing: '1970' }
      default:
        return { interval: '1M', format: 'yyyy-MM', missing: '1970-01' }
    }
  }

  get values() {
    return uniq(super.values.map((v) => parseInt(v)))
  }
}
