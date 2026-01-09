<template>
  <div class="widget">
    <div class="widget__header d-md-flex align-items-start gap-2">
      <h3 class="widget__header__title flex-grow-1 my-2">
        {{ t('widgetDocumentsByCreationDateByPath.title') }}
      </h3>
      <div class="widget__header__selectors d-flex align-items-center my-2">
        <slot
          name="selector"
          :selected-path="selectedPath"
          :set-selected-path="setSelectedPath"
        />
        <div class="btn-group">
          <button
            v-for="(_, interval) in intervals"
            :key="interval"
            :class="{
              'btn-action': selectedInterval === interval,
              'btn-outline-light': selectedInterval !== interval
            }"
            class="btn btn-sm px-3 widget__header__selectors__selector"
            @click="setSelectedInterval(interval)"
          >
            {{ t('widget.creationDate.intervals.' + interval) }}
          </button>
        </div>
      </div>
    </div>
    <div class="widget__content">
      <app-wait :for="loaderId">
        <template #waiting>
          <div class="widget__content_spinner text-secondary text-center p-5">
            <app-spinner size="2em" />
          </div>
        </template>
        <div
          v-if="hasData"
          ref="widget__content__chart"
          class="widget__content__chart align-items-center"
        >
          <column-chart
            :key="dataKey"
            hover
            :hover-icon="IPhMagnifyingGlassBold"
            :chart-height-ratio="0.4"
            :data="aggregatedDataSlice"
            :x-axis-tick-format="xAxisTickFormat"
            @select="searchInterval"
          >
            <template #tooltip="{ datum: { date, value: total } }">
              <h5 class="m-0">
                {{ tooltipFormat(date) }}
              </h5>
              <p class="m-0 text-nowrap">
                {{ t('widget.creationDate.document', { total }, total) }}
              </p>
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
        <div
          v-else
          class="text-muted text-center"
        >
          {{ t('widget.noData') }}
        </div>
        <div
          v-if="missings"
          class="widget__content__missing small d-flex align-items-center mt-2"
        >
          <p
            class="my-0 text-muted"
            :title="t('widget.creationDate.missingTooltip')"
          >
            {{ t('widget.creationDate.missing', { total: n(missings) }, missings) }}
          </p>
        </div>
      </app-wait>
    </div>
  </div>
</template>

<script setup>
import bodybuilder from 'bodybuilder'
import { clamp, get } from 'lodash'
import * as d3 from 'd3'
import { computed, nextTick, ref, useTemplateRef, watch, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { whenever } from '@vueuse/core'

import IPhMagnifyingGlassBold from '~icons/ph/magnifying-glass-bold'

import { useInsightsStore } from '@/store/modules'
import { useWait } from '@/composables/useWait'
import { useCore } from '@/composables/useCore'
import AppWait from '@/components/AppWait/AppWait'
import AppSpinner from '@/components/AppSpinner/AppSpinner'
import ColumnChartPicker from '@/components/ColumnChartPicker'
import FilterDate from '@/store/filters/FilterDate'

/**
 * Widget to display the number of files by creation date on the insights page.
 */
defineOptions({ name: 'WidgetDocumentsByCreationDate' })

const props = defineProps({
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
})

const wait = useWait()
const { t, n } = useI18n()
const core = useCore()
const insightsStore = useInsightsStore()
const router = useRouter()

const data = ref([])
const intervals = {
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
}
const dataKey = ref(0)
const sliceRange = ref({ start: null, end: null })
const selectedInterval = ref('year')
const selectedPath = ref(null)

const chartRef = useTemplateRef('widget__content__chart')

const chartWidth = computed(() => {
  return chartRef.value?.offsetWidth || 0
})

const dataDir = computed(() => {
  return core.getDefaultDataDir()
})
const selectedIntervalTime = computed(() => {
  return intervals[selectedInterval.value].time
})
const selectedIntervalBins = computed(() => {
  return intervals[selectedInterval.value].bins
})
const datesExtent = computed(() => {
  if (data.value.length) {
    return d3.extent(cleanData.value, d => d.date)
  }
  return []
})
const intervalDatesExtent = computed(() => {
  const start = toIntervalStart(datesExtent.value[0] ?? new Date())
  const end = toIntervalEnd(datesExtent.value[1] ?? new Date())
  return [start, end]
})
const hasData = computed(() => {
  return data.value.length > 0
})
const datesScale = computed(() => {
  return d3.scaleUtc().domain(intervalDatesExtent.value)
})
const widthScale = computed(() => {
  return datesScale.value.copy().rangeRound([0, chartWidth.value])
})
const ticksScale = computed(() => {
  return datesScale.value.copy().rangeRound([0, datesHistogram.value.length])
})
const datesHistogram = computed(() => {
  const minTime = selectedIntervalTime.value.offset(datesExtent.value[0], -1)
  const maxTime = selectedIntervalTime.value.offset(datesExtent.value[1], 1)
  const bins = selectedIntervalBins.value(minTime, maxTime)
  // set the parameters for the histogram
  const histogram = d3
    .histogram()
    .value(d => d.date)
    .domain(widthScale.value.domain())
    .thresholds(widthScale.value.copy().ticks(bins.length))
  return histogram(cleanData.value)
})
const datesHistogramSlice = computed(() => {
  return datesHistogram.value.slice(startTick.value, endTick.value)
})
const maxSliceTicks = computed(() => {
  return clamp(1, Math.round(chartWidth.value / props.minColumnWidth), datesHistogram.value.length)
})
const startTick = computed(() => {
  return ticksScale.value(sliceRange.value?.start)
})
const endTick = computed(() => {
  return ticksScale.value(sliceRange.value?.end)
})

const aggregatedDataSlice = computed(() => {
  return datesHistogramSlice.value.map((bin) => {
    return { date: bin.x0, value: d3.sum(bin, d => d.doc_count) }
  })
})
const aggDateHistogramOptions = computed(() => {
  return {
    ...FilterDate.getIntervalOption(selectedInterval.value),
    order: { _key: 'asc' },
    min_doc_count: 1
  }
})
const selectedPathTokens = computed(() => {
  return selectedPath.value !== dataDir.value ? [selectedPath.value] : []
})
const loaderId = computed(() => {
  return wait.loaderId
})
const cleanData = computed(() => {
  return data.value.filter(isBucketValid).map((bucket) => {
    bucket.date = new Date(bucket.key)
    return bucket
  })
})
const missingData = computed(() => {
  return data.value.filter(bucket => !isBucketValid(bucket))
})
const missings = computed(() => {
  return missingData.value.reduce((sum, { doc_count: count }) => sum + count, 0)
})
const hasRangePicker = computed(() => {
  return sliceRange.value && datesHistogram.value.length > Math.round(chartWidth.value / props.minColumnWidth)
})

async function init() {
  await loadData()
  if (cleanData.value.length) {
    const end = intervalDatesExtent.value[1]
    const endTick = ticksScale.value(end)
    const startTick = Math.max(0, endTick - Math.max(1, maxSliceTicks.value))
    const start = ticksScale.value.invert(startTick)
    sliceRange.value = { start, end }
  }
}
function isBucketValid({ key }) {
  return key > 0 && key < new Date().getTime()
}
function bodybuilderBase({ size = 1000, from = 0 } = {}) {
  const field = 'metadata.tika_metadata_dcterms_created'
  return bodybuilder()
    .size(0)
    .andQuery('bool', (bool) => {
      // Add all path tokens in a "should" statement
      selectedPathTokens.value.forEach((t) => {
        bool.orQuery('term', 'dirname.tree', t)
      })
      return bool
    })
    .andQuery('match', 'type', 'Document')
    .agg(
      'date_histogram',
      field,
      'agg_by_creation_date',
      sub => sub.agg('bucket_sort', { size, from }, 'bucket_sort_truncate'),
      aggDateHistogramOptions.value
    )
}

function updateData(dataValues) {
  data.value = dataValues
}
async function loadData() {
  wait.start(loaderId.value)
  const body = bodybuilderBase().build()
  const preference = 'widget-documents-by-creation-date'
  const index = insightsStore.project
  const size = 0
  const res = await core.api.elasticsearch.search({ index, size, body, preference })
  updateData(get(res, 'aggregations.agg_by_creation_date.buckets', []))
  wait.end(loaderId.value)
}
function setSelectedPath(path) {
  selectedPath.value = path
  return init()
}
function setSelectedInterval(value) {
  selectedInterval.value = value
  return init()
}
function tooltipFormat(date) {
  return intervals[selectedInterval.value].tooltipFormat(date)
}
function xAxisTickFormat(date) {
  return intervals[selectedInterval.value].xAxisFormat(date)
}
function toIntervalStart(date) {
  const startMonth = selectedInterval.value === 'year' ? 0 : date.getMonth()
  const startDay = selectedInterval.value !== 'day' ? 1 : date.getDate()
  return new Date(Date.UTC(date.getFullYear(), startMonth, startDay))
}
function toIntervalEnd(date) {
  const monthOffset = Number(selectedInterval.value !== 'day')
  const endMonth = (selectedInterval.value === 'year' ? 11 : date.getMonth()) + monthOffset
  const endDay = selectedInterval.value !== 'day' ? 0 : date.getDate()
  return new Date(Date.UTC(date.getFullYear(), endMonth, endDay, 23, 59, 59))
}
function searchInterval({ date }) {
  const bin = dateToBin(date)
  const query = binToQuery(bin)
  return router.push({ name: 'search', query })
}
function dateToBin(date) {
  return datesHistogram.value.find(({ x0, x1 }) => date >= x0 && date < x1)
}
function binToQueryValues({ x0, x1 }) {
  return [x0.getTime(), x1.getTime()]
}
function binToQuery(bin) {
  const indices = [insightsStore.project]
  const creationDateField = 'f[creationDate]'
  const values = binToQueryValues(bin)
  const query = { [creationDateField]: values.slice(0, 2).join(':'), indices }
  if (selectedPath.value !== dataDir.value) {
    query['f[path]'] = selectedPath.value
  }
  return query
}

whenever(toRef(insightsStore, 'project'), async () => {
  selectedPath.value = dataDir.value
  await nextTick()
  await init()
}, { immediate: true })

watch(sliceRange, (value, previousValue) => {
  dataKey.value++
  // Safe access to the slice range values
  const { start, end } = value ?? { start: 0, end: 1 }
  const { start: prevStart = 0, end: prevEnd = 1 } = previousValue ?? { start: 0, end: 1 }
  // The new range size is bigger than the allowed ticks number
  if (endTick.value - startTick.value > maxSliceTicks.value) {
    // We are moving the range from the start
    if (start < prevStart) {
      const sliceEnd = ticksScale.value.invert(startTick.value + maxSliceTicks.value)
      sliceRange.value = { ...sliceRange.value, end: sliceEnd }
    }
    // We are moving the range from the end
    if (end > prevEnd) {
      const sliceStart = ticksScale.value.invert(endTick.value - maxSliceTicks.value)
      sliceRange.value = { ...sliceRange.value, start: sliceStart }
    }
  }
})
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
      text-wrap: pretty;
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
    fill: var(--bs-secondary-bg-subtle);
    cursor: pointer;

    &:hover {
      fill: var(--bs-action);
    }
  }

  &:deep(.column-chart__columns__item__hover-icon) {
    color: #fff;
  }

  &:deep(.column-chart__axis .tick line) {
    stroke: var(--bs-tertiary-bg-subtle);
  }
}
</style>
