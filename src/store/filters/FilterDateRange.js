import { isInteger } from 'lodash'
import dayjs from 'dayjs'

import FilterDate from './FilterDate'

import DisplayDatetimeRange from '@/components/Display/DisplayDatetimeRange'

/**
 * Date filter driven by a single `min:max` range instead of discrete
 * histogram buckets. Expects one string value in the form `"gte:lte"`.
 */
export default class FilterDateRange extends FilterDate {
  /**
   * @param {object} options - See `FilterText` for base options.
   * @param {string} [options.interval='year'] - Histogram granularity for the range picker.
   */
  constructor({ interval = 'year', ...options }) {
    super(options)
    this.component = 'FilterTypeDateRange'
    this.interval = interval
  }

  /**
   * Format a bucket key as a localized date string.
   * @param {object} item - Histogram bucket.
   * @param {number|string} item.key - Epoch milliseconds or pre-formatted string.
   * @returns {string} Localized date label.
   */
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

  /**
   * Build a single `range` query from the first selected `"gte:lte"` value.
   * @param {object} body - Bodybuilder instance.
   * @param {{values: string[]}} param - Selection with a single `"min:max"` string.
   * @param {string} func - Bodybuilder chain method (`query` or `notQuery`).
   * @returns {object} The mutated body (or the original body if no value is selected).
   */
  queryBuilder(body, param, func) {
    if (!param?.values?.length) return body

    const [minValue, maxValue = minValue] = param.values[0].split(':').map(Number)
    const gte = new Date(Math.min(minValue, maxValue))
    const lte = new Date(Math.max(minValue, maxValue))

    return body.query('bool', sub => sub[func]('range', this.key, { gte, lte }))
  }

  /**
   * Attach a `date_histogram` aggregation so the UI can display a range picker.
   * @param {object} body - Bodybuilder instance.
   * @param {object} [options]
   * @param {string} [options.interval] - Histogram interval (defaults to the instance's `interval`).
   * @returns {object} The mutated body.
   */
  body(body, { interval = this.interval } = {}) {
    return body
      .query('match', 'type', 'Document')
      .agg('date_histogram', this.key, FilterDateRange.getIntervalAgg(interval), this.key)
  }

  /**
   * Aggregation options for the histogram without the descending sort.
   * @param {string} [interval] - Histogram interval.
   * @returns {object} Elasticsearch aggregation options.
   */
  static getIntervalAgg(interval = this.interval) {
    return { ...FilterDate.getIntervalOption(interval), min_doc_count: 1 }
  }

  /**
   * Elasticsearch interval options for the given granularity.
   * @param {string} [interval] - One of `day`, `month`, `year`.
   * @returns {object} Bucket interval + format configuration.
   */
  static getIntervalOption(interval = this.interval) {
    switch (interval) {
      case 'day':
        return { fixed_interval: '1d', format: 'yyyy-MM-dd', missing: '1970-01-01' }
      case 'month':
        return { calendar_interval: '1M', format: 'yyyy-MM', missing: '1970-01' }
      default:
        return { calendar_interval: '1y', format: 'yyyy', missing: '1970' }
    }
  }

  /** @returns {object} Display component used to render the selected range. */
  static get display() {
    return DisplayDatetimeRange
  }
}
