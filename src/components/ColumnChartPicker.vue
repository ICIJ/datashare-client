<script>
import { clamp, compact, throttle } from 'lodash'
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
    }
  },
  data() {
    return {
      intervals: {
        year: {
          time: d3.utcYear,
          bins: d3.utcYears
        },
        month: {
          time: d3.utcMonth,
          bins: d3.utcMonths
        }
      }
    }
  },
  computed: {
    range: {
      get() {
        return compact([this.rangeStart, this.rangeEnd])
      },
      set: throttle(function ([rangeStart, rangeEnd]) {
        const scale = d3.scaleLinear([0, 1], this.timesExtent)
        const start = scale(rangeStart)
        const end = scale(rangeEnd)
        this.$emit('update', { start, end })
      }, 1000)
    },
    rangeScale() {
      return d3.scaleLinear(this.timesExtent, [0, 1])
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
    intervalTime() {
      return this.intervals[this.interval].time
    },
    intervalBins() {
      const minTime = this.intervalTime.offset(this.datesExtent[0], -1)
      const maxTime = this.intervalTime.offset(this.datesExtent[1], 1)
      const { bins } = this.intervals[this.interval]
      return bins(minTime, maxTime)
    },
    timesExtent() {
      return d3.extent(this.cleanData, (d) => d.key)
    },
    datesExtent() {
      return d3.extent(this.cleanData, (d) => d.date)
    },
    datesScale() {
      return d3.scaleUtc().domain(this.datesExtent).rangeRound([0, this.chartWidth])
    },
    datesThresholds() {
      return this.datesScale.ticks(this.intervalBins.length)
    },
    datesHistogram() {
      const histogram = d3
        .histogram()
        .value((d) => d.key)
        .domain(this.datesScale.domain())
        .thresholds(this.datesThresholds)
      return histogram(this.data)
    },
    ticks() {
      return clamp(1, this.endTick - this.startTick, this.maxTicks)
    },
    startTick() {
      return Math.round(this.range[0] * this.datesHistogram.length)
    },
    endTick() {
      return Math.round(this.range[1] * this.datesHistogram.length)
    },
    isDatesRangeSliced() {
      return this.datesHistogram.length > this.ticks
    },
    cleanData() {
      return this.data.reduce((buckets, bucket) => {
        if (this.isBucketKeyInRange(bucket.key)) {
          bucket.date = new Date(bucket.key)
          buckets.push(bucket)
        }
        return buckets
      }, [])
    },
    aggregatedData() {
      return this.datesHistogram.map((bin) => {
        return { date: bin.x0, value: d3.sum(bin, (d) => d.doc_count) }
      })
    }
  },
  methods: {
    isBucketKeyInRange(key) {
      return key > 0 && key < new Date().getTime()
    }
  }
}
</script>

<template>
  <range-picker v-model="range" class="column-chart-picker py-1 my-1 overflow-hidden" rounded variant="light">
    <column-chart
      :key="interval"
      :data="aggregatedData"
      :fixed-height="100"
      :bar-padding="0"
      :bar-margin="1"
      class="column-chart-picker__chart"
      column-color="currentColor"
      no-tooltips
      no-x-axis
      no-y-axis
    />
  </range-picker>
</template>
