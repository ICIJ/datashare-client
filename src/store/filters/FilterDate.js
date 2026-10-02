import FilterDocument from './FilterDocument'

import DisplayDatetimeMonth from '@/components/Display/DisplayDatetimeMonth'
import { humanMonthDate } from '@/utils/humanDate'

/**
 * Filter over a date field using a `date_histogram` aggregation. Each
 * selected bucket becomes a month (by default) `range` query; the zero
 * bucket is mapped to "field does not exist".
 */
export default class FilterDate extends FilterDocument {
  constructor(options) {
    super(options)
    this.component = 'FilterType'
  }

  /**
   * @param {object} item - Histogram bucket.
   * @param {string} [item.key_as_string] - Pre-formatted bucket key, as ES's
   * histogram response provides it. A caller with only the raw route-query
   * value (e.g. a locked breadcrumb chip) won't have this - fall back to
   * formatting `item.key` directly rather than returning `undefined`. Route
   * query values arrive as strings, so this checks numeric-ness by
   * coercion rather than `isInteger`, which only accepts an actual number.
   * @param {number|string} item.key - Epoch milliseconds, as a number or a numeric string.
   * @returns {string} The bucket's key string used as the display label.
   */
  itemLabel(item) {
    if (item.key_as_string) {
      return item.key_as_string
    }
    const key = Number(item.key)
    if (Number.isFinite(key)) {
      // dayjs's own .locale(x) treats a falsy x as a getter call rather than
      // a no-op setter, breaking the format() chain entirely - fall back to
      // a concrete locale rather than the null localStorage returns before a
      // user ever explicitly changes it.
      const locale = localStorage.getItem('locale') ?? 'en'
      return humanMonthDate(key, locale)
    }
    return item.key
  }

  /**
   * Build one `range` query per selected bucket; treat `0` as "field missing".
   * @param {object} body - Bodybuilder instance.
   * @param {{values: (string|number)[]}} param - Current selection of bucket keys.
   * @param {string} func - Bodybuilder chain method (`query` or `notQuery`).
   * @returns {object} The mutated body.
   */
  queryBuilder(body, param, func) {
    return body.query('bool', (sub) => {
      param.values.forEach((date) => {
        if (parseInt(date) === 0) {
          sub.notQuery('exists', this.key)
        }
        else {
          const gte = new Date(parseInt(date))
          const tmp = new Date(parseInt(date))
          const lte = new Date(tmp.setMonth(tmp.getMonth() + 1) - 1)
          sub[func]('range', this.key, { gte, lte })
        }
      })
      return sub
    })
  }

  /**
   * Attach a `date_histogram` aggregation over this filter's date field.
   * @param {object} body - Bodybuilder instance.
   * @param {object} [options]
   * @param {number} [options.size=0] - Maximum buckets returned (0 = unlimited).
   * @param {string} [options.interval='month'] - Histogram interval: `day`, `month`, or `year`.
   * @returns {object} The mutated body.
   */
  body(body, { size = 0, interval = 'month' } = {}) {
    return body
      .query('match', 'type', 'Document')
      .agg('date_histogram', this.key, FilterDate.getIntervalAgg(interval), this.key, (a) => {
        return a.agg('bucket_sort', { size }, 'bucket_sort_truncate')
      })
  }

  /**
   * Aggregation options for the histogram: interval + sort by most recent.
   * @param {string} [interval='month'] - Histogram interval.
   * @returns {object} Elasticsearch aggregation options.
   */
  static getIntervalAgg(interval = 'month') {
    return {
      ...FilterDate.getIntervalOption(interval),
      min_doc_count: 1,
      order: {
        _key: 'desc'
      }
    }
  }

  /**
   * Elasticsearch interval options (fixed/calendar) for the given granularity.
   * @param {string} [interval='month'] - One of `day`, `month`, `year`.
   * @returns {object} Bucket interval + format configuration.
   */
  static getIntervalOption(interval = 'month') {
    switch (interval) {
      case 'day':
        return { fixed_interval: '1d', format: 'yyyy-MM-dd', missing: '1970-01-01' }
      case 'month':
        return { calendar_interval: '1M', format: 'yyyy-MM', missing: '1970-01' }
      default:
        return { calendar_interval: '1y', format: 'yyyy', missing: '1970' }
    }
  }

  /** @returns {object} Display component used to render selected values. */
  static get display() {
    return DisplayDatetimeMonth
  }
}
