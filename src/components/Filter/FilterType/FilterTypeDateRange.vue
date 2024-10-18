<script setup>
import { computed } from 'vue'
import { property } from 'lodash'

import { useSearchFilter } from '@/composables/search-filter'
import ColumnChartPicker from '@/components/ColumnChartPicker'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FormControlDateRange from '@/components/Form/FormControl/FormControlDateRange/FormControlDateRange'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const { getFilterValues, setFilterValue } = useSearchFilter()

const toInt = (value) => parseInt(value, 10)
const toDate = (value) => new Date(value)
const toTimestamp = (value) => toDate(value).getTime()
const toEndOfDayTimestamp = (value) => toDate(value).setUTCHours(23, 59, 59, 999)

const selected = computed({
  get() {
    // Convert values from filter to Date objects
    const [start, end] = getFilterValues(props.filter).map(toInt).map(toDate)
    return { start, end }
  },
  set(values) {
    // Convert Date objects to timestamps
    if (values) {
      const [start, end] = Object.values(values).map(toTimestamp)
      const key = [start, toEndOfDayTimestamp(end)]
      return setFilterValue(props.filter, { key })
    }
  }
})
</script>

<template>
  <filter-type :filter="filter" flush>
    <template #default="{ entries }">
      <form-control-date-range v-model="selected" size="sm" />
      <column-chart-picker
        v-if="entries.length > 1"
        v-model="selected"
        class="mx-1 mt-3"
        :data="entries.map(property('item'))"
        :interval="filter.interval"
      />
    </template>
  </filter-type>
</template>

<!-- <template>
  <filter-boilerplate
    ref="filter"
    class="filter--date-range"
    v-bind="$props"
    hide-show-more
    hide-contextualize
    hide-sort
    no-infinite-scroll
  >
    <template #items="{ items }">
      <div class="mx-2">
        <date-picker
          ref="calendar"
          :key="locale"
          v-model.range.number="selectedDate"
          class="date-picker d-flex flex-grow-1"
          :popover="{ visibility: 'click' }"
          is-dark
          color="yellow"
          :model-config="{ type: 'number' }"
          :attributes="attributes"
          :locale="locale"
          :update-on-input="false"
          transition="fade"
          @dayclick="updateFocus"
        >
          <template #default="{ inputValue, inputEvents }">
            <div class="filter--date-range__inputs d-inline-flex justify-content-between align-items-center">
              <input
                ref="dateStart"
                :title="$t('filter.dateRange.from', { dateFormat: datePlaceholder })"
                :alt="$t('filter.dateRange.startingDate')"
                :placeholder="datePlaceholder"
                :value="inputValue.start"
                class="filter--date-range__inputs__start form-control form-control-sm"
                v-on="inputEvents.start"
              />
              <fa icon="arrow-right" fixed-width />
              <input
                ref="dateEnd"
                :title="$t('filter.dateRange.to', { dateFormat: datePlaceholder })"
                :alt="$t('filter.dateRange.endingDate')"
                :placeholder="datePlaceholder"
                :value="inputValue.end"
                class="filter--date-range__inputs__end form-control form-control-sm"
                v-on="inputEvents.end"
              />
            </div>
          </template>
        </date-picker>
        <column-chart-picker
          v-if="items.length > 1"
          v-model="selectedDate"
          class="mx-1 mt-3"
          :data="items"
          :interval="filter.interval"
        />
      </div>
    </template>
  </filter-boilerplate>
</template>

<script>
import { DatePicker } from 'v-calendar'
import max from 'lodash/max'
import min from 'lodash/min'

import ColumnChartPicker from '@/components/ColumnChartPicker'
import FilterAbstract from '@/components/Filter/FilterType/FilterType'
import FilterBoilerplate from '@/components/Filter/FilterBoilerplate'

/**
 * A Filter component to pick a date range.
 */
export default {
  name: 'FilterDateRange',
  components: {
    DatePicker,
    ColumnChartPicker,
    FilterBoilerplate
  },
  extends: FilterAbstract,
  data() {
    return {
      datePlaceholder: ''
    }
  },
  computed: {
    attributes() {
      return [
        {
          key: 'today',
          dates: new Date()
        }
      ]
    },
    locale() {
      return this.$i18n.locale
    },
    selectedDate: {
      get() {
        const values = this.getFilterValuesByName(this.filter.name) || []
        if (values.length < 2) {
          return null
        }
        const start = parseInt(min(values))
        const end = parseInt(max(values))
        return { start, end }
      },
      set(range) {
        if (range === null) {
          return this.setFilterValue(this.filter, { key: [] })
        }
        let start = Number.isInteger(range.start) ? new Date(range.start) : range.start
        let end = Number.isInteger(range.end) ? new Date(range.end) : range.end
        start = start - start.getTimezoneOffset() * 60 * 1000
        end = end - end.getTimezoneOffset() * 60 * 1000 + 24 * 60
        this.setFilterValue(this.filter, { key: [start, end] })
        return this.refreshRouteAndSearch()
      }
    }
  },
  watch: {
    async locale() {
      await this.$nextTick()
      this.updatePlaceholder()
    }
  },
  async mounted() {
    this.updatePlaceholder()
  },
  methods: {
    updatePlaceholder() {
      this.datePlaceholder = 'MM/DD/YYYY'
    },
    async updateFocus() {
      await this.$nextTick()
      const start = this.$refs.dateStart
      const end = this.$refs.dateEnd
      if (start.value?.trim().length && start.value === end.value) {
        end.focus()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.filter.filter--date-range {
  .filter--date-range__inputs {
    flex: 0 1 100%;

    input {
      width: 45%;
      background: #000;
      color: inherit;

      &:not(:focus) {
        border-color: #000;
      }
    }
  }

  &:deep(.range-picker__bounds__end.btn:hover),
  &:deep(.range-picker__bounds__start.btn:hover) {
    background: var(--bg);
  }
}
</style> -->
