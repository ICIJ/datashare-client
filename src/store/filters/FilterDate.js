import FilterDocument from './FilterDocument'

export default class FilterDate extends FilterDocument {
  constructor (options) {
    super(options)
    this.component = 'FilterDate'
  }
  itemLabel (item) {
    return item.key_as_string
  }
  queryBuilder (body, param, func) {
    return body.query('bool', sub => {
      param.values.forEach(date => {
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
  body (body, options) {
    let interval = { interval: '1M', format: 'yyyy-MM', missing: '0001-01' }
    switch (options.interval) {
      case 'day':
        interval = { interval: '1d', format: 'yyyy-MM-dd', missing: '0001-01-01' }
        break
      case 'month':
        interval = { interval: '1M', format: 'yyyy-MM', missing: '0001-01' }
        break
      case 'year':
        interval = { interval: '1y', format: 'yyyy', missing: '0001' }
        break
      default :
        break
    }
    return body
      .query('match', 'type', 'Document')
      .agg('date_histogram', this.key, {
        order: { _key: 'desc' },
        min_doc_count: 1,
        ...interval
      }, this.key, a => a.agg('bucket_sort', { size: options.size }, 'bucket_sort_truncate'))
  }
}
