import { isInteger } from 'lodash'
import dayjs from 'dayjs'

import FilterDate from './FilterDate'

import DisplayDatetimeRange from '@/components/Display/DisplayDatetimeRange'

export default class FilterDateRange extends FilterDate {
  constructor({ interval = 'year', ...options }) {
    super(options)
    this.component = 'FilterTypeDateRange'
    this.interval = interval
  }

  itemLabel(item) {
    if (isInteger(item.key)) {
      const timestamp = item.key + new Date().getTimezoneOffset() * 60 * 1000
      const locale = localStorage.getItem('locale')
      return dayjs(timestamp).locale(locale).format('L')
    }
    else {
      return item.key
    }
  }

  queryBuilder(body, param, func) {
    if (!param?.values?.length) return body

    const [minValue, maxValue = minValue] = param.values[0].split(':').map(Number)
    const gte = new Date(Math.min(minValue, maxValue))
    const lte = new Date(Math.max(minValue, maxValue))

    return body.query('bool', sub => sub[func]('range', this.key, { gte, lte }))
  }

  body(body, { interval = this.interval } = {}) {
    return body
      .query('match', 'type', 'Document')
      .agg('date_histogram', this.key, FilterDateRange.getIntervalAgg(interval), this.key)
  }

  static getIntervalAgg(interval = this.interval) {
    return { ...FilterDate.getIntervalOption(interval), min_doc_count: 1 }
  }

  static getIntervalOption(interval = this.interval) {
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
    return DisplayDatetimeRange
  }
}
