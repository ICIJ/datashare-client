import FilterDocument from './FilterDocument'

import DisplayDatetimeMonth from '@/components/Display/DisplayDatetimeMonth'

export default class FilterDate extends FilterDocument {
  constructor(options) {
    super(options)
    this.component = 'FilterDate'
  }

  itemLabel(item) {
    return item.key_as_string
  }

  queryBuilder(body, param, func) {
    return body.query('bool', (sub) => {
      param.values.forEach((date) => {
        if (parseInt(date) === 0) {
          sub.notQuery('exists', this.key)
        } else {
          const gte = new Date(parseInt(date))
          const tmp = new Date(parseInt(date))
          const lte = new Date(tmp.setMonth(tmp.getMonth() + 1) - 1)
          sub[func]('range', this.key, { gte, lte })
        }
      })
      return sub
    })
  }

  body(body, { size = 0, interval = 'month' } = {}) {
    return body
      .query('match', 'type', 'Document')
      .agg('date_histogram', this.key, FilterDate.getIntervalAgg(interval), this.key, (a) => {
        return a.agg('bucket_sort', { size }, 'bucket_sort_truncate')
      })
  }

  static getIntervalAgg(interval = 'month') {
    return {
      ...FilterDate.getIntervalOption(interval),
      min_doc_count: 1,
      order: {
        _key: 'desc'
      }
    }
  }

  static getIntervalOption(interval = 'month') {
    switch (interval) {
      case 'day':
        return { interval: '1d', format: 'yyyy-MM-dd', missing: '1970-01-01' }
      case 'month':
        return { interval: '1M', format: 'yyyy-MM', missing: '1970-01' }
      default:
        return { interval: '1y', format: 'yyyy', missing: '1970' }
    }
  }

  static get display() {
    return DisplayDatetimeMonth
  }
}
