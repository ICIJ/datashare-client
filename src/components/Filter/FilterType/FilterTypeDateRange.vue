<script setup>
import { computed } from 'vue'
import { property } from 'lodash'

import { useSearchFilter } from '@/composables/useSearchFilter'
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
    // Only get the first value (for retro-compatibility, it used to be two values together)
    const [value = null] = getFilterValues(props.filter)
    // No value, no bounding dates
    if (!value) return null
    // Convert values from filter to Date objects
    const [start, end = start] = value.split(':').map(toInt).map(toDate)
    return { start, end }
  },
  set(values) {
    // Convert Date objects to timestamps
    if (values && values.start && values.end) {
      const now = Date.now()
      const [start = now, end = start] = Object.values(values).map(toTimestamp)
      const key = [start, toEndOfDayTimestamp(end)].join(':')
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
