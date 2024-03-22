<script>
import { cloneDeep, defaultTo, iteratee, isNumber, last, throttle } from 'lodash'
import * as d3 from 'd3'

/**
 * Widget to display the number of file by creation date on the insights page.
 */
export default {
  name: 'ColumnChartPicker',
  model: {
    prop: 'value',
    event: 'update'
  },
  props: {
    /**
     * Initial values of the range bounds. Should contain two timestamps.
     * indicating the start and end of the range.
     */
    value: {
      type: Object,
      default: null
    },
    /**
     * The data to visualize (from an ElasticSearch aggregation)
     */
    data: {
      type: Array
    },
    /**
     * Active interval unit
     */
    interval: {
      type: String,
      default: 'year'
    },
    /**
     * Throttle to trigger the update
     */
    throttle: {
      type: Number,
      default: 1000
    },
    /**
     * Should or should not "snap" range picker
     */
    columnSnap: {
      type: Boolean
    },
    /**
     * Add a margin to each column
     */
    columnMargin: {
      type: Number,
      default: 0
    },
    /**
     * Change the ratio of the columns' height
     */
    columnHeightRatio: {
      type: Number,
      default: 0.3
    },
    /**
     * Apply a different variant color to the range picker
     */
    variant: {
      type: String,
      default: 'warning'
    }
  },
  data() {
    return {
      intervals: {
        year: {
          format: d3.utcFormat('%Y'),
          time: d3.utcYear,
          bins: d3.utcYears
        },
        month: {
          format: d3.utcFormat('%b. %Y'),
          time: d3.utcMonth,
          bins: d3.utcMonths
        },
        day: {
          format: d3.utcFormat('%B %d, %Y'),
          time: d3.utcDay,
          bins: d3.utcDays
        }
      }
    }
  },
  computed: {
    range: {
      get() {
        return [this.rangeStart, this.rangeEnd].filter(isNumber)
      },
      set(range) {
        return this.setRangeWithThrottle(range)
      }
    },
    setRangeWithThrottle() {
      return throttle(function ([rangeStart, rangeEnd]) {
        // The range is expressed in timestamps but
        // the scale might returns floating values so
        // we needc to round it first.
        const start = new Date(Math.round(this.rangeScale.invert(rangeStart)))
        const end = new Date(Math.round(this.rangeScale.invert(rangeEnd)))
        /**
         * Fired when the range is update
         * @event update
         * @param Object New range value
         */
        this.$emit('update', { start, end })
      }, this.throttle)
    },
    rangeScale() {
      return d3.scaleLinear(this.intervalTimesExtent, [0, 1])
    },
    rangeStart() {
      return this.value?.start ? this.rangeScale(this.value.start) : null
    },
    rangeEnd() {
      return this.value?.end ? this.rangeScale(this.value.end) : null
    },
    chartWidth() {
      return this.$el?.querySelector('.column-chart-picker__chart')?.offsetWidth ?? 0
    },
    intervalFormat() {
      return this.intervals[this.interval].format
    },
    intervalBins() {
      const minTime = this.intervalTime.offset(this.datesExtent[0], -1)
      const maxTime = this.intervalTime.offset(this.datesExtent[1], 1)
      const { bins } = this.intervals[this.interval]
      return bins(minTime, maxTime)
    },
    intervalTime() {
      return this.intervals[this.interval].time
    },
    start() {
      return this.intervalDatesExtent[0]
    },
    end() {
      return this.intervalDatesExtent[1]
    },
    startYear() {
      return this.start.getFullYear()
    },
    endYear() {
      return this.end.getFullYear()
    },
    intervalTimesExtent() {
      const start = this.toIntervalStart(this.datesExtent[0] ?? new Date()).getTime()
      const end = this.toIntervalEnd(this.datesExtent[1] ?? new Date()).getTime()
      return [start, end]
    },
    datesExtent() {
      return d3.extent(this.cleanData, iteratee('date'))
    },
    intervalDatesExtent() {
      const start = this.toIntervalStart(this.datesExtent[0] ?? new Date())
      const end = this.toIntervalEnd(this.datesExtent[1] ?? new Date())
      return [start, end]
    },
    datesScale() {
      return d3.scaleUtc().domain(this.intervalDatesExtent).rangeRound([0, this.chartWidth])
    },
    datesThresholds() {
      return this.datesScale.ticks(this.intervalBins.length)
    },
    datesHistogram() {
      const histogram = d3
        .histogram()
        .value(iteratee('key'))
        .domain(this.datesScale.domain())
        .thresholds(this.datesThresholds)
      return histogram(this.cleanData)
    },
    cleanData() {
      return this.data
        .filter(this.isBucketValid)
        .map(cloneDeep)
        .map((datum) => {
          datum.date = new Date(datum.key)
          return datum
        })
    },
    aggregatedData() {
      return this.datesHistogram.map((bin) => {
        return { date: bin.x0, value: d3.sum(bin, iteratee('doc_count')) }
      })
    },
    minRangeDistance() {
      return 1 / (this.endYear - this.startYear)
    },
    snap() {
      if (this.columnSnap) {
        return 1 / this.aggregatedData.length
      }
      return 0.000001
    }
  },
  methods: {
    isBucketValid({ key }) {
      return key > 0 && key < new Date().getTime()
    },
    select({ date }) {
      const bin = this.datesHistogram.find(({ x0, x1 }) => date >= x0 && date < x1)
      // We found the histogram bin or we use the last
      const { x0: start, x1: end } = defaultTo(bin, last(this.datesHistogram))
      /**
       * Fired when the range is update
       * @event update
       * @param Object New range value
       */
      this.$emit('update', { start, end })
    },
    toIntervalStart(date) {
      const startMonth = this.interval === 'year' ? 0 : date.getMonth()
      return new Date(Date.UTC(date.getFullYear(), startMonth, 1))
    },
    toIntervalEnd(date) {
      const endMonth = this.interval === 'year' ? 11 : date.getMonth()
      return new Date(Date.UTC(date.getFullYear(), endMonth + 1, 0, 23, 59, 59))
    }
  }
}
</script>

<template>
  <div class="column-chart-picker overflow-visible">
    <range-picker
      v-model:range="range"
      class="column-chart-picker__range my-1"
      rounded
      :variant="variant"
      :min-distance="minRangeDistance"
      :snap="snap"
    >
      <column-chart
        :key="interval"
        :data="aggregatedData"
        :chart-height-ratio="columnHeightRatio"
        :bar-padding="0"
        :bar-margin="columnMargin"
        class="column-chart-picker__range__chart"
        column-color="currentColor"
        no-tooltips
        no-y-axis
        no-x-axis
        hover
        @select="select"
      />
    </range-picker>
    <div class="column-chart-picker__scale d-flex">
      <div>{{ intervalFormat(start) }}</div>
      <div class="ms-auto">{{ intervalFormat(end) }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.column-chart-picker {
  &__range {
    &__chart {
      fill: currentColor;

      &:deep(.column-chart__columns__item) {
        cursor: pointer;
      }
    }
  }

  &__scale {
    font-weight: bold;
    opacity: 0.6;
  }
}
</style>
