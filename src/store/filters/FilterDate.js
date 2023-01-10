import FilterDocument from './FilterDocument'

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
        if (parseInt(date) === -62167219200000) {
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
  body(body, { size = 0, interval = 'month ' } = {}) {
    return body.query('match', 'type', 'Document').agg(
      'date_histogram',
      this.key,
      {
        ...FilterDate.getIntervalOptions(interval),
        order: { _key: 'desc' },
        min_doc_count: 1
      },
      this.key,
      (a) => a.agg('bucket_sort', { size }, 'bucket_sort_truncate')
    )
  }
  static getIntervalOptions(interval = 'month') {
    switch (interval) {
      case 'day':
        return { interval: '1d', format: 'yyyy-MM-dd', missing: '0001-01-01' }
      case 'month':
        return { interval: '1M', format: 'yyyy-MM', missing: '0001-01' }
      case 'year':
        return { interval: '1y', format: 'yyyy', missing: '0001' }
      default:
        return { interval: '1M', format: 'yyyy-MM', missing: '0001-01' }
    }
  }
}
