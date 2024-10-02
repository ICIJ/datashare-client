<template>
  <div class="widget">
    <div v-if="widget.title" class="widget__header d-md-flex align-items-center">
      <h3 class="widget__header__title m-0 flex-grow-1" v-html="widget.title"></h3>
      <div class="widget__header__selectors d-flex align-items-center">
        <slot name="selector" :selected-path="selectedPath" :set-selected-path="setSelectedPath" />
        <div class="btn-group">
          <button
            v-for="(_, interval) in intervals"
            :key="interval"
            :class="{
              'btn-action': selectedInterval === interval,
              'btn-outline-light': selectedInterval !== interval
            }"
            class="btn py-1 px-3 widget__header__selectors__selector"
            @click="setSelectedInterval(interval)"
          >
            {{ $t('widget.creationDate.intervals.' + interval) }}
          </button>
        </div>
      </div>
    </div>
    <div class="widget__content">
      <v-wait :for="loader">
        <template #waiting>
          <div class="widget__content_spinner">
            <fa icon="circle-notch" spin size="2x"></fa>
          </div>
        </template>
        <div v-if="data.length > 0" class="widget__content__chart align-items-center">
          <column-chart
            hover
            :chart-height-ratio="0.4"
            :data="aggregatedDataSlice"
            :x-axis-tick-format="xAxisTickFormat"
            @select="searchInterval"
          >
            <template #tooltip="{ datum: { date, value: total } }">
              <h5 class="m-0">{{ tooltipFormat(date) }}</h5>
              <p class="m-0 text-nowrap">{{ $t('widget.creationDate.document', total, { total }) }}</p>
            </template>
          </column-chart>
          <column-chart-picker
            v-if="hasRangePicker"
            v-model="sliceRange"
            column-snap
            :throttle="0"
            :interval="selectedInterval"
            :data="cleanData"
            :column-margin="2"
            :column-height-ratio="0.1"
          />
        </div>
        <div v-else class="text-muted text-center">
          {{ $t('widget.noData') }}
        </div>
        <div v-if="missings" class="widget__content__missing small d-flex align-items-center mt-2">
          <p class="my-0 text-muted" :title="$t('widget.creationDate.missingTooltip')">
            {{ $t('widget.creationDate.missing', missings, { total: $n(missings) }) }}
          </p>
        </div>
      </v-wait>
    </div>
  </div>
</template>

<script>
import bodybuilder from 'bodybuilder'
import { clamp, get, uniqueId } from 'lodash'
import { mapState } from 'vuex'
import * as d3 from 'd3'

import ColumnChartPicker from '@/components/ColumnChartPicker'
import FilterDate from '@/store/filters/FilterDate'

/**
 * Widget to display the number of file by creation date on the insights page.
 */
export default {
  name: 'WidgetDocumentsByCreationDate',
  components: {
    ColumnChartPicker
  },
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
          xAxisFormat: d3.utcFormat('%Y'),
          tooltipFormat: d3.utcFormat('%Y'),
          time: d3.utcYear,
          bins: d3.utcYears
        },
        month: {
          xAxisFormat: (date) => {
            if (date.getMonth() === 0) {
              return d3.utcFormat('%Y')(date)
            }
          },
          tooltipFormat: d3.utcFormat('%B, %Y'),
          time: d3.utcMonth,
          bins: d3.utcMonths
        }
      },
      mounted: false,
      sliceRange: { start: null, end: null },
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
      return d3.max(this.cleanData, ({ doc_count: value = 0 }) => value)
    },
    dataDir() {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    },
    selectedIntervalTime() {
      return this.intervals[this.selectedInterval].time
    },
    selectedIntervalBins() {
      return this.intervals[this.selectedInterval].bins
    },
    datesExtent() {
      if (this.data.length) {
        return d3.extent(this.cleanData, (d) => d.date)
      }
      return []
    },
    intervalDatesExtent() {
      const start = this.toIntervalStart(this.datesExtent[0] ?? new Date())
      const end = this.toIntervalEnd(this.datesExtent[1] ?? new Date())
      return [start, end]
    },
    datesScale() {
      return d3.scaleUtc().domain(this.intervalDatesExtent)
    },
    widthScale() {
      return this.datesScale.copy().rangeRound([0, this.chartWidth])
    },
    ticksScale() {
      return this.datesScale.copy().rangeRound([0, this.datesHistogram.length])
    },
    datesHistogram() {
      const minTime = this.selectedIntervalTime.offset(this.datesExtent[0], -1)
      const maxTime = this.selectedIntervalTime.offset(this.datesExtent[1], 1)
      const bins = this.selectedIntervalBins(minTime, maxTime)
      // set the parameters for the histogram
      const histogram = d3
        .histogram()
        .value((d) => d.date)
        .domain(this.widthScale.domain())
        .thresholds(this.widthScale.copy().ticks(bins.length))
      return histogram(this.cleanData)
    },
    datesHistogramSlice() {
      return this.datesHistogram.slice(this.startTick, this.endTick)
    },
    maxSliceTicks() {
      return clamp(1, Math.round(this.chartWidth / this.minColumnWidth), this.datesHistogram.length)
    },
    startTick() {
      return this.ticksScale(this.sliceRange?.start)
    },
    endTick() {
      return this.ticksScale(this.sliceRange?.end)
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
        ...FilterDate.getIntervalOption(this.selectedInterval),
        order: { _key: 'asc' },
        min_doc_count: 1
      }
    },
    selectedPathTokens() {
      return this.selectedPath !== this.dataDir ? [this.selectedPath] : []
    },
    loader() {
      return uniqueId('loading-creation-date-buckets')
    },
    cleanData() {
      return this.data.filter(this.isBucketValid).map((bucket) => {
        bucket.date = new Date(bucket.key)
        return bucket
      })
    },
    missingData() {
      return this.data.filter((bucket) => !this.isBucketValid(bucket))
    },
    missings() {
      return this.missingData.reduce((sum, { doc_count: count }) => sum + count, 0)
    },
    hasRangePicker() {
      return this.sliceRange && this.datesHistogram.length > Math.round(this.chartWidth / this.minColumnWidth)
    }
  },
  watch: {
    project() {
      this.selectedPath = this.dataDir
      this.init()
    },
    sliceRange(value, previousValue) {
      this.dataKey++
      // Safe access to the slice range values
      const { start, end } = value ?? { start: 0, end: 1 }
      const { start: prevStart = 0, end: prevEnd = 1 } = previousValue ?? { start: 0, end: 1 }
      // The new range size is bigger than the allowed ticks number
      if (this.endTick - this.startTick > this.maxSliceTicks) {
        // We are moving the range from the start
        if (start < prevStart) {
          this.sliceRange.end = this.ticksScale.invert(this.startTick + this.maxSliceTicks)
        }
        // We are moving the range from the end
        if (end > prevEnd) {
          this.sliceRange.start = this.ticksScale.invert(this.endTick - this.maxSliceTicks)
        }
      }
    }
  },
  async mounted() {
    this.selectedPath = this.dataDir
    await this.$nextTick()
    await this.init()
  },
  methods: {
    async init() {
      await this.loadData()
      this.mounted = true
      if (this.cleanData.length) {
        const end = this.intervalDatesExtent[1]
        const endTick = this.ticksScale(end)
        const startTick = Math.max(0, endTick - Math.max(1, this.maxSliceTicks))
        const start = this.ticksScale.invert(startTick)
        this.sliceRange = { start, end }
      }
    },
    isBucketValid({ key }) {
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
          (sub) => sub.agg('bucket_sort', { size, from }, 'bucket_sort_truncate'),
          this.aggDateHistogramOptions
        )
    },
    async loadData() {
      this.$wait.start(this.loader)
      const body = this.bodybuilderBase().build()
      const preference = 'widget-documents-by-creation-date'
      const res = await this.$core.api.elasticsearch.search({ index: this.project, size: 0, body, preference })
      this.data = get(res, 'aggregations.agg_by_creation_date.buckets', [])
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
      return this.intervals[this.selectedInterval].tooltipFormat(date)
    },
    xAxisTickFormat(date) {
      return this.intervals[this.selectedInterval].xAxisFormat(date)
    },
    toIntervalStart(date) {
      const startMonth = this.selectedInterval === 'year' ? 0 : date.getMonth()
      const startDay = this.selectedInterval !== 'day' ? 1 : date.getDate()
      return new Date(Date.UTC(date.getFullYear(), startMonth, startDay))
    },
    toIntervalEnd(date) {
      const monthOffset = Number(this.selectedInterval !== 'day')
      const endMonth = (this.selectedInterval === 'year' ? 11 : date.getMonth()) + monthOffset
      const endDay = this.selectedInterval !== 'day' ? 0 : date.getDate()
      return new Date(Date.UTC(date.getFullYear(), endMonth, endDay, 23, 59, 59))
    },
    searchInterval({ date }) {
      const bin = this.dateToBin(date)
      const query = this.binToQuery(bin)
      this.$router.push({ name: 'search', query })
    },
    dateToBin(date) {
      return this.datesHistogram.find(({ x0, x1 }) => date >= x0 && date < x1)
    },
    binToQueryValues({ x0, x1 }) {
      return [x0.getTime(), x1.getTime()]
    },
    binToQuery(bin) {
      const indices = [this.project]
      const routeQueryField = 'f[creationDate]'
      const values = this.binToQueryValues(bin)
      return { [routeQueryField]: values, indices }
    }
  }
}
</script>

<style lang="scss" scoped>
.widget {
  min-height: 100%;

  .card & {
    padding: $spacer-xxl;
  }

  &__header {
    margin-bottom: $spacer-xl;

    &__title {
      font-weight: 500;
      font-size: 1rem;
      line-height: 1.5rem;
    }

    &__selectors {
      &__selector + &__selector {
        margin-left: 0;
      }
    }
  }

  &__content {
    &__spinner {
      text-align: center;
      background: $card-bg;
      padding: $spacer;
    }
  }

  &:deep(.column-chart__columns__item) {
    fill: var(--bs-tertiary);
    cursor: pointer;
  }
}
</style>
