<template>
  <div class="widget">
    <div
      v-if="widget.title"
      class="widget__header d-md-flex align-items-center"
      :class="{ 'card-header': widget.card }"
    >
      <h4 class="m-0 flex-grow-1" v-html="widget.title"></h4>
      <div class="widget__header__selectors d-flex align-items-center">
        <slot name="selector" :selected-path="selectedPath" :set-selected-path="setSelectedPath"></slot>
        <div class="btn-group">
          <span
            v-for="(value, interval) in intervals"
            :key="interval"
            class="btn btn-link border py-1 px-2"
            :class="{ active: selectedInterval === interval }"
          >
            <span class="widget__header__selectors__selector" @click="setSelectedInterval(interval)">
              {{ $t('widget.creationDate.intervals.' + interval) }}
            </span>
          </span>
        </div>
      </div>
    </div>
    <div class="widget__content" :class="{ 'card-body': widget.card }">
      <v-wait :for="loader">
        <div slot="waiting" class="widget__content__spinner">
          <fa icon="circle-notch" spin size="2x"></fa>
        </div>
        <div v-if="data.length > 0" class="widget__content__chart align-items-center">
          <column-chart :data="aggregatedDataSlice" :max-value="maxValue" :x-axis-tick-format="xAxisTickFormat">
            <template #tooltip="{ datum: { date, value: total } }">
              <h5 class="m-0">{{ tooltipFormat(date) }}</h5>
              <p class="m-0">{{ $tc('widget.creationDate.document', total, { total }) }}</p>
            </template>
          </column-chart>
          <range-picker
            v-if="isDatesRangeSliced"
            v-model="sliceRange"
            :snap="1 / aggregatedData.length"
            class="widget__content__chart__range"
            rounded
            variant="secondary"
          >
            <column-chart
              :key="selectedInterval"
              :data="aggregatedData"
              :fixed-height="100"
              :bar-padding="0"
              :bar-margin="4"
              no-tooltips
              no-x-axis
              no-y-axis
            />
          </range-picker>
          <div class="d-flex align-items-center mt-2">
            <p
              v-if="missing"
              class="widget__content__missing small my-0 text-muted"
              :title="$t('widget.creationDate.missingTooltip')"
            >
              {{ $tc('widget.creationDate.missing', missing, { total: $n(missing) }) }}
            </p>
          </div>
        </div>
        <div v-else class="text-muted text-center">
          {{ $t('widget.noData') }}
        </div>
      </v-wait>
    </div>
  </div>
</template>

<script>
import bodybuilder from 'bodybuilder'
import get from 'lodash/get'
import clamp from 'lodash/clamp'
import isFunction from 'lodash/isFunction'
import uniqueId from 'lodash/uniqueId'
import * as d3 from 'd3'
import { mapState } from 'vuex'

import FilterDate from '@/store/filters/FilterDate'

/**
 * Widget to display the number of file by creation date on the insights page.
 */
export default {
  name: 'WidgetDocumentsByCreationDate',
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object
    },
    /**
     * Minimum width of the columns
     */
    minColumnWidth: {
      type: Number,
      default: 45
    }
  },
  data() {
    return {
      data: [],
      intervals: {
        year: {
          xAxisFormat: '%Y',
          tooltipFormat: '%Y',
          time: d3.utcYear,
          bins: d3.utcYears
        },
        month: {
          xAxisFormat: (date) => {
            if (date.getMonth() === 0) {
              return d3.utcFormat('%Y')(date)
            }
          },
          tooltipFormat: '%B, %Y',
          time: d3.utcMonth,
          bins: d3.utcMonths
        }
      },
      mounted: false,
      missing: 0,
      startTick: 0,
      endTick: 1,
      selectedInterval: 'year',
      selectedPath: null
    }
  },
  computed: {
    ...mapState('insights', ['project']),
    chartWidth() {
      if (this.mounted) {
        return this.$el.querySelector('.widget__content__chart')?.offsetWidth || 0
      }
      return 0
    },
    maxValue() {
      return d3.max(this.data, ({ doc_count: value = 0 }) => value)
    },
    dataDir() {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    },
    selectedIntervalFormat() {
      return this.intervals[this.selectedInterval].xAxisFormat
    },
    selectedTooltipFormat() {
      return this.intervals[this.selectedInterval].tooltipFormat
    },
    selectedIntervalTime() {
      return this.intervals[this.selectedInterval].time
    },
    selectedIntervalBins() {
      return this.intervals[this.selectedInterval].bins
    },
    binByDate() {
      return this.datesHistogram.reduce((res, bin) => {
        const key = bin.x0.getTime()
        res[key] = bin
        return res
      }, {})
    },
    datesExtent() {
      return d3.extent(this.data, (d) => d.date)
    },
    datesScale() {
      return d3.scaleUtc().domain(this.datesExtent).rangeRound([0, this.chartWidth])
    },
    datesHistogram() {
      const minTime = this.selectedIntervalTime.offset(this.datesExtent[0], -1)
      const maxTime = this.selectedIntervalTime.offset(this.datesExtent[1], 1)
      const bins = this.selectedIntervalBins(minTime, maxTime)
      // set the parameters for the histogram
      const histogram = d3
        .histogram()
        .value((d) => d.date)
        .domain(this.datesScale.domain())
        .thresholds(this.datesScale.ticks(bins.length))
      return histogram(this.data)
    },
    datesHistogramSlice() {
      return this.datesHistogram.slice(this.startTick, this.endTick)
    },
    ticks() {
      return clamp(1, this.endTick - this.startTick, this.maxTicks)
    },
    maxTicks() {
      return Math.floor(this.chartWidth / this.minColumnWidth)
    },
    sliceRange: {
      get() {
        return [this.sliceRangeStart, this.sliceRangeEnd]
      },
      set([start, end]) {
        const ticks = Math.round((end - start) * this.datesHistogram.length)
        const reachedMax = ticks > this.maxTicks
        const startDelta = reachedMax && end > this.sliceRangeEnd ? ticks - this.maxTicks : 0
        const endDelta = reachedMax && start < this.sliceRangeStart ? ticks - this.maxTicks : 0
        this.startTick = Math.round(start * this.datesHistogram.length) + startDelta
        this.endTick = Math.round(end * this.datesHistogram.length) - endDelta
      }
    },
    sliceRangeStart() {
      return this.startTick / this.datesHistogram.length
    },
    sliceRangeEnd() {
      return this.endTick / this.datesHistogram.length
    },
    maxstartingTick() {
      return Math.max(0, this.datesHistogram.length - this.ticks)
    },
    isDatesRangeSliced() {
      return this.datesHistogram.length > this.ticks
    },
    aggregatedData() {
      return this.datesHistogram.map((bin) => {
        return { date: bin.x0, value: d3.sum(bin, (d) => d.doc_count) }
      })
    },
    aggregatedDataSlice() {
      return this.datesHistogramSlice.map((bin) => {
        return { date: bin.x0, value: d3.sum(bin, (d) => d.doc_count) }
      })
    },
    aggDateHistogramOptions() {
      return {
        ...FilterDate.getIntervalOptions(this.selectedInterval),
        order: { _key: 'asc' },
        min_doc_count: 1
      }
    },
    selectedPathTokens() {
      return this.selectedPath !== this.dataDir ? [this.selectedPath] : []
    },
    loader() {
      return uniqueId('loading-creation-date-buckets')
    }
  },
  watch: {
    project() {
      this.mounted = false
      this.selectedPath = this.dataDir
      this.init()
    }
  },
  mounted() {
    this.selectedPath = this.dataDir
    this.$nextTick(this.init)
  },
  methods: {
    async init() {
      await this.loadData()
      this.mounted = true
      this.endTick = this.datesHistogram.length
      this.startTick = this.endTick - this.maxTicks
    },
    isBucketKeyInRange(key) {
      return key > 0 && key < new Date().getTime()
    },
    bodybuilderBase({ size = 1000, from = 0 } = {}) {
      const field = 'metadata.tika_metadata_dcterms_created'
      return bodybuilder()
        .size(0)
        .andQuery('bool', (bool) => {
          // Add all path tokens in a "should" statement
          this.selectedPathTokens.forEach((t) => {
            bool.orQuery('term', 'dirname.tree', t)
          })
          return bool
        })
        .andQuery('match', 'type', 'Document')
        .agg(
          'date_histogram',
          field,
          'agg_by_creation_date',
          (sub) => {
            return sub.agg('bucket_sort', { size, from }, 'bucket_sort_truncate')
          },
          this.aggDateHistogramOptions
        )
    },
    async loadData() {
      this.$wait.start(this.loader)
      this.missing = 0
      const body = this.bodybuilderBase().build()
      const preference = 'widget-documents-by-creation-date'
      const res = await this.$core.api.elasticsearch.search({ index: this.project, size: 0, body, preference })
      const aggregation = get(res, 'aggregations.agg_by_creation_date.buckets', [])
      const data = aggregation.reduce((buckets, bucket) => {
        if (this.isBucketKeyInRange(bucket.key)) {
          bucket.date = new Date(bucket.key)
          buckets.push(bucket)
        } else {
          this.missing += bucket.doc_count
        }
        return buckets
      }, [])
      this.$set(this, 'data', data)
      this.$wait.end(this.loader)
    },
    setSelectedPath(path) {
      this.mounted = false
      this.selectedPath = path
      this.init()
    },
    setSelectedInterval(value) {
      this.mounted = false
      this.selectedInterval = value
      this.init()
    },
    tooltipFormat(date) {
      if (isFunction(this.selectedTooltipFormat)) {
        return this.selectedTooltipFormat(date)
      }
      return d3.utcFormat(this.selectedTooltipFormat)(date)
    },
    xAxisTickFormat(date) {
      if (isFunction(this.selectedIntervalFormat)) {
        return this.selectedIntervalFormat(date)
      }
      return d3.utcFormat(this.selectedIntervalFormat)(date)
    }
  }
}
</script>

<style lang="scss">
.widget {
  min-height: 100%;

  &__header__selectors__selector {
    cursor: pointer;
  }

  &__content {
    &__spinner {
      text-align: center;
      background: $card-bg;
      padding: $spacer;
    }

    &__chart {
      &__range:hover {
        background: $light;
      }
    }
  }
}
</style>
