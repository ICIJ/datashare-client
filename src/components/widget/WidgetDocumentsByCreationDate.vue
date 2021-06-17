<template>
  <div class="widget">
    <div class="widget__header d-md-flex align-items-center" v-if="widget.title" :class="{ 'card-header': widget.card }">
      <h4 v-html="widget.title" class="m-0 flex-grow-1"></h4>
      <div class="widget__header__selectors d-flex align-items-center">
        <slot name="selector" :selectedPath="selectedPath" :setSelectedPath="setSelectedPath"></slot>
        <div class="btn-group">
          <span v-for="(value, interval) in intervals" :key="interval" class="btn btn-link border py-1 px-2" :class="{ 'active': selectedInterval === interval }">
            <span class="widget__header__selectors__selector" @click="setSelectedInterval(interval)">
              {{ $t('widget.creationDate.intervals.' + interval) }}
            </span>
          </span>
        </div>
      </div>
    </div>
    <div class="widget__content" :class="{ 'card-body': widget.card }">
      <v-wait :for="loader">
        <div class="widget__content__spinner" slot="waiting">
          <fa icon="circle-notch" spin size="2x"></fa>
        </div>
        <div class="widget__content__chart align-items-center" v-if="data.length > 0">
            <column-chart :data="slicedDataForMurmur" :max-value="maxValue" :x-axis-tick-format="xAxisTickFormat">
              <template #tooltip="{ datum: { date, value: total } }">
                <h5 class="m-0">{{ tooltipFormat(date) }}</h5>
                <p class="m-0">{{ $tc('widget.creationDate.document', total,  { total }) }}</p>
              </template>
            </column-chart>
            <div v-if="isDatesRangeSliced" class="widget__content__chart__range">
              <div class="widget__content__chart__range__selection border border-primary" :style="datesRangeSelectionStyle">
                <b-button pill variant="outline-dark" @click="previousDatesRangeSlice" v-if="hasPreviousDatesRangeSlice" class="widget__content__chart__range__selection__previous bg-white">
                  <fa icon="angle-left" />
                </b-button>
                <b-button pill variant="outline-dark" @click="nextDatesRangeSlice" v-if="hasNextDatesRangeSlice" class="widget__content__chart__range__selection__next bg-white">
                  <fa icon="angle-right" />
                </b-button>
              </div>
              <column-chart :data="dataForMurmur" :fixed-height="100" no-tooltips no-x-axis no-y-axis />
            </div>
            <div class="d-flex align-items-center mt-2">
              <p class="widget__content__missing small my-0 text-muted" v-if="missing" :title="$t('widget.creationDate.missingTooltip')">
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
import compact from 'lodash/compact'
import get from 'lodash/get'
import isFunction from 'lodash/isFunction'
import reduce from 'lodash/reduce'
import sortBy from 'lodash/sortBy'
import uniqueId from 'lodash/uniqueId'
import * as d3 from 'd3'
import { mapState } from 'vuex'

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
  data () {
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
      loader: `loading creationDate data ${uniqueId()}`,
      mounted: false,
      missing: 0,
      sliceStart: 0,
      selectedInterval: 'year',
      selectedPath: null
    }
  },
  watch: {
    project () {
      this.$set(this, 'mounted', false)
      this.$set(this, 'selectedPath', this.dataDir)
      this.init()
    }
  },
  mounted () {
    this.$set(this, 'selectedPath', this.dataDir)
    this.$nextTick(() => this.init())
  },
  computed: {
    ...mapState('insights', ['project']),
    chartWidth () {
      if (this.mounted) {
        return this.$el.querySelector('.widget__content__chart')?.offsetWidth || 0
      }
      return 0
    },
    maxTicks () {
      return Math.floor(this.chartWidth / 25)
    },
    maxValue () {
      return d3.max(this.data, ({ doc_count: value = 0 }) => value)
    },
    dataDir () {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    },
    selectedIntervalFormat () {
      return this.intervals[this.selectedInterval].xAxisFormat
    },
    selectedTooltipFormat () {
      return this.intervals[this.selectedInterval].tooltipFormat
    },
    selectedIntervalTime () {
      return this.intervals[this.selectedInterval].time
    },
    selectedIntervalBins () {
      return this.intervals[this.selectedInterval].bins
    },
    binByDate () {
      return reduce(this.datesHistogram, (res, bin) => {
        const key = bin.x0.getTime()
        res[key] = bin
        return res
      }, {})
    },
    datesExtent () {
      return d3.extent(this.data, d => d.date)
    },
    datesScale () {
      return d3.scaleTime().domain(this.datesExtent).rangeRound([0, this.chartWidth])
    },
    datesHistogram () {
      const minTime = this.selectedIntervalTime.offset(this.datesExtent[0], -1)
      const maxTime = this.selectedIntervalTime.offset(this.datesExtent[1], 1)
      const bins = this.selectedIntervalBins(minTime, maxTime)
      // set the parameters for the histogram
      const histogram = d3.histogram()
        .value(d => d.date)
        .domain(this.datesScale.domain())
        .thresholds(this.datesScale.ticks(bins.length))
      return histogram(this.data)
    },
    slicedDatesHistogram () {
      return this.datesHistogram.slice(this.datesRangeSliceStart, this.datesRangeSliceEnd)
    },
    maxSliceStart () {
      return Math.max(0, this.datesHistogram.length - this.maxTicks)
    },
    datesRangeSliceStart () {
      return Math.min(this.sliceStart, this.maxSliceStart)
    },
    datesRangeSliceEnd () {
      return this.datesRangeSliceStart + this.maxTicks
    },
    hasNextDatesRangeSlice () {
      return this.datesRangeSliceStart < this.maxSliceStart
    },
    hasPreviousDatesRangeSlice () {
      return this.datesRangeSliceStart > 0
    },
    isDatesRangeSliced () {
      return this.datesHistogram.length > this.maxTicks
    },
    dataForMurmur () {
      return this.datesHistogram.map(bin => {
        return { date: bin.x0, value: d3.sum(bin, d => d.doc_count) }
      })
    },
    slicedDataForMurmur () {
      return this.slicedDatesHistogram.map(bin => {
        return { date: bin.x0, value: d3.sum(bin, d => d.doc_count) }
      })
    },
    datesRangeSelectionStyle () {
      const ticks = this.datesHistogram.length
      const left = `${this.datesRangeSliceStart / ticks * 100}%`
      const right = `${(ticks - this.datesRangeSliceEnd) / ticks * 100}%`
      return { right, left }
    }
  },
  methods: {
    async init () {
      await this.loadData()
      this.mounted = true
    },
    getQueryFilters () {
      if (this.selectedPath !== this.dataDir) {
        const filter = this.$store.getters['insights/getFilter']({ name: 'path' })
        filter.values = [this.selectedPath]
        return [filter]
      }
      return []
    },
    isBucketKeyInRange (key) {
      return key > 0 && key < new Date().getTime()
    },
    async loadData () {
      this.$wait.start(this.loader)
      this.missing = 0
      const options = { size: 1000, interval: this.selectedInterval }
      const filters = this.getQueryFilters()
      const response = await this.$store.dispatch('insights/queryFilter', { name: 'creationDate', options, filters })
      const aggregation = get(response, ['aggregations', 'metadata.tika_metadata_creation_date', 'buckets'])
      const dates = aggregation.map(d => {
        if (this.isBucketKeyInRange(d.key)) {
          d.date = new Date(d.key)
          return d
        } else {
          this.missing += d.doc_count
          return null
        }
      })
      this.$set(this, 'data', sortBy(compact(dates), ['key']))
      this.$wait.end(this.loader)
    },
    setSelectedPath (path) {
      this.mounted = false
      this.sliceStart = 0
      this.selectedPath = path
      this.init()
    },
    setSelectedInterval (value) {
      this.mounted = false
      this.sliceStart = 0
      this.selectedInterval = value
      this.init()
    },
    nextDatesRangeSlice () {
      const step = Math.round(this.slicedDatesHistogram.length * 0.1)
      this.sliceStart = Math.min(this.sliceStart + step, this.maxSliceStart)
    },
    previousDatesRangeSlice () {
      const step = Math.round(this.slicedDatesHistogram.length * 0.1)
      this.sliceStart = Math.max(this.sliceStart - step, 0)
    },
    tooltipFormat (date) {
      if (isFunction(this.selectedTooltipFormat)) {
        return this.selectedTooltipFormat(date)
      }
      return d3.timeFormat(this.selectedTooltipFormat)(date)
    },
    xAxisTickFormat (date) {
      if (isFunction(this.selectedIntervalFormat)) {
        return this.selectedIntervalFormat(date)
      }
      return d3.timeFormat(this.selectedIntervalFormat)(date)
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
        align-items: center;
        display: flex;
        height: 100%;
        justify-content: center;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
        z-index: $zindex-modal;
        background: $card-bg;
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

            &__previous, &__next {
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
