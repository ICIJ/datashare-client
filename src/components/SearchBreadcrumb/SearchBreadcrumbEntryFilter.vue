<script setup>
import { computed } from 'vue'
import { trimStart } from 'lodash'

import SearchBreadcrumbEntryQueryTerm from './SearchBreadcrumbEntryQueryTerm'

import filters from '@/store/filters'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String
  },
  value: {
    type: String
  },
  color: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: null
  }
})

const filter = computed(() => {
  return filters.find((filter) => filter.options.name === props.name)
})

const prefix = computed(() => {
  return props.name[0] === '-' ? '-' : ''
})

const field = computed(() => {
  return trimStart(props.name, '-')
})

const term = computed(() => {
  if (filter.value) {
    return props.value
  }
  return `${field.value}:${props.value}`
})

const icon = computed(() => {
  return props.icon ?? filter.value?.options?.icon ?? 'magnifying-glass'
})

const color = computed(() => {
  return props.color ?? filter.value?.options?.color
})
</script>

<template>
  <search-breadcrumb-entry-query-term :term="term" :prefix="prefix" :icon="icon" :color="color" />
</template>
