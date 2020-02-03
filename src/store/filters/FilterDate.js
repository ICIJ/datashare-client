import FacetDocument from './FilterDocument'

export default class FacetDate extends FacetDocument {
  constructor (name, key, icon, isSearchable, labelFun) {
    super(name, key, icon, isSearchable, labelFun)
    this.component = 'FacetDate'
  }

  queryBuilder (body, param, func) {
    return body.query('bool', sub => {
      param.values.forEach(date => {
        if (parseInt(date) === -62167219200000) {
          sub['notQuery']('exists', this.key)
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
    return body
      .query('match', 'type', 'Document')
      .agg('date_histogram', this.key, {
        interval: '1M',
        format: 'yyyy-MM',
        order: { '_key': 'desc' },
        min_doc_count: 1,
        missing: '0000-01'
      }, this.key, a => a.agg('bucket_sort', { size: options.size }, 'bucket_sort_truncate'))
  }
}
