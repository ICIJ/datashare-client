<template>
  <div class="widget">
    <div
      v-if="widget.title"
      class="widget__header d-md-flex align-items-center"
      :class="{ 'card-header': widget.card }"
    >
      <h4 class="m-0 flex-grow-1" v-html="widget.title"></h4>
      <div class="widget__header__selectors d-flex align-items-center">
        <slot name="selector" :selectedPath="selectedPath" :setSelectedPath="setSelectedPath"></slot>
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
          <column-chart :data="slicedDataForMurmur" :max-value="maxValue" :x-axis-tick-format="xAxisTickFormat">
            <template #tooltip="{ datum: { date, value: total } }">
              <h5 class="m-0">{{ tooltipFormat(date) }}</h5>
              <p class="m-0">{{ $tc('widget.creationDate.document', total, { total }) }}</p>
            </template>
          </column-chart>
          <div v-if="isDatesRangeSliced" class="widget__content__chart__range">
            <div
              class="widget__content__chart__range__selection border border-primary"
              :style="datesRangeSelectionStyle"
            >
              <b-button
                v-if="hasPreviousDatesRangeSlice"
                pill
                variant="outline-dark"
                class="widget__content__chart__range__selection__previous bg-white"
                @click="previousDatesRangeSlice"
              >
                <fa icon="angle-left" />
              </b-button>
              <b-button
                v-if="hasNextDatesRangeSlice"
                pill
                variant="outline-dark"
                class="widget__content__chart__range__selection__next bg-white"
                @click="nextDatesRangeSlice"
              >
                <fa icon="angle-right" />
              </b-button>
            </div>
            <column-chart
              :data="dataForMurmur"
              :fixed-height="100"
              no-tooltips
              no-x-axis
              no-y-axis
              @click.native="jumpToSelectionRange"
            />
          </div>
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
import isFunction from 'lodash/isFunction'
import uniqueId from 'lodash/uniqueId'
import * as d3 from 'd3'
import { mapState } from 'vuex'

import FilterDate from '@/store/filters/FilterDate'
import elasticsearch from '@/api/elasticsearch'

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
    }
  },
  data() {
    return {
      data: [],
      intervals: {
        year: {
          xAxisFormat: '%Y',
          tooltipFormat: '%Y',
          time: d3.timeYear,
          bins: d3.timeYears
        },
        month: {
          xAxisFormat: (date) => {
            if (date.getMonth() === 0) {
              return d3.timeFormat('%Y')(date)
            }
          },
          tooltipFormat: '%B, %Y',
          time: d3.timeMonth,
          bins: d3.timeMonths
        }
      },
      mounted: false,
      missing: 0,
      sliceStart: 0,
      selectedInterval: 'year',
      selectedPath: null
    }
  },
  watch: {
    project() {
      this.$set(this, 'mounted', false)
      this.$set(this, 'selectedPath', this.dataDir)
      this.init()
    }
  },
  mounted() {
    this.$set(this, 'selectedPath', this.dataDir)
    this.$nextTick(() => this.init())
  },
  computed: {
    ...mapState('insights', ['project']),
    chartWidth() {
      if (this.mounted) {
        return this.$el.querySelector('.widget__content__chart')?.offsetWidth || 0
      }
      return 0
    },
    maxTicks() {
      return Math.floor(this.chartWidth / 35)
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
      return d3.scaleTime().domain(this.datesExtent).rangeRound([0, this.chartWidth])
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
    slicedDatesHistogram() {
      return this.datesHistogram.slice(this.datesRangeSliceStart, this.datesRangeSliceEnd)
    },
    maxSliceStart() {
      return Math.max(0, this.datesHistogram.length - this.maxTicks)
    },
    datesRangeSliceStart() {
      return Math.min(this.sliceStart, this.maxSliceStart)
    },
    datesRangeSliceEnd() {
      return this.datesRangeSliceStart + this.maxTicks
    },
    hasNextDatesRangeSlice() {
      return this.datesRangeSliceStart < this.maxSliceStart
    },
    hasPreviousDatesRangeSlice() {
      return this.datesRangeSliceStart > 0
    },
    isDatesRangeSliced() {
      return this.datesHistogram.length > this.maxTicks
    },
    dataForMurmur() {
      return this.datesHistogram.map((bin) => {
        return { date: bin.x0, value: d3.sum(bin, (d) => d.doc_count) }
      })
    },
    slicedDataForMurmur() {
      return this.slicedDatesHistogram.map((bin) => {
        return { date: bin.x0, value: d3.sum(bin, (d) => d.doc_count) }
      })
    },
    datesRangeSelectionStyle() {
      const ticks = this.datesHistogram.length
      const left = `${(this.datesRangeSliceStart / ticks) * 100}%`
      const right = `${((ticks - this.datesRangeSliceEnd) / ticks) * 100}%`
      return { right, left }
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
  methods: {
    async init() {
      await this.loadData()
      this.mounted = true
      this.sliceStart = this.maxSliceStart
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
      const res = await elasticsearch.search({ index: this.project, size: 0, body, preference })
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
    nextDatesRangeSlice() {
      const step = Math.round(this.slicedDatesHistogram.length * 0.1)
      this.sliceStart = Math.min(this.sliceStart + step, this.maxSliceStart)
    },
    previousDatesRangeSlice() {
      const step = Math.round(this.slicedDatesHistogram.length * 0.1)
      this.sliceStart = Math.max(this.sliceStart - step, 0)
    },
    tooltipFormat(date) {
      if (isFunction(this.selectedTooltipFormat)) {
        return this.selectedTooltipFormat(date)
      }
      return d3.timeFormat(this.selectedTooltipFormat)(date)
    },
    xAxisTickFormat(date) {
      if (isFunction(this.selectedIntervalFormat)) {
        return this.selectedIntervalFormat(date)
      }
      return d3.timeFormat(this.selectedIntervalFormat)(date)
    },
    jumpToSelectionRange({ target, clientX }) {
      const { width } = target.getBBox()
      const { left } = target.getBoundingClientRect()
      const x = (clientX - left) / width
      const sliceStart = Math.round(this.datesHistogram.length * x)
      this.sliceStart = Math.min(sliceStart, this.maxSliceStart)
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
      &__range {
        position: relative;

        &__selection {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          background: rgba($gray-300, 0.5);
          pointer-events: none;

          &__previous,
          &__next {
            pointer-events: all;
            position: absolute;
            top: 50%;
            width: 2.5rem;
            height: 2.5rem;
            line-height: 2.5rem;
            padding: 0;
            background: white;
          }

          &__previous {
            left: 0;
            transform: translate(-50%, -50%);
          }

          &__next {
            right: 0;
            transform: translate(50%, -50%);
          }
        }
      }
    }
  }
}
</style>
