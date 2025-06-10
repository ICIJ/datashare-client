<script setup>
import { computed } from 'vue'
import { trimStart } from 'lodash'
import { useI18n } from 'vue-i18n'

import SearchParameterQueryTerm from './SearchParameterQueryTerm'

import * as types from '@/store/filters'
import filtersDefs from '@/store/filters'

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
    type: [String, Object, Array],
    default: null
  },
  iconLabel: {
    type: String,
    default: null
  },
  size: {
    type: String
  },
  operator: {
    type: String
  },
  noIcon: {
    type: Boolean
  },
  noXIcon: {
    type: Boolean
  }
})

const { t } = useI18n()

const filter = computed(() => {
  return filtersDefs.find((filter) => filter.options.name === field.value)
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
  return props.icon ?? filter.value?.options?.icon ?? PhMagnifyingGlass
})

const iconLabel = computed(() => {
  return props.iconLabel ?? t(`filter.${filter.value?.options?.name}`)
})

const color = computed(() => {
  return props.color ?? filter.value?.options?.color
})

const display = computed(() => {
  return filter.value && types[filter.value.type].display ? types[filter.value.type].display : null
})
</script>

<template>
  <search-parameter-query-term
    :term="term"
    :operator="operator"
    :prefix="prefix"
    :size="size"
    :icon="icon"
    :icon-label="iconLabel"
    :color="color"
    :no-icon="noIcon"
    :no-x-icon="noXIcon"
  >
    <component :is="display" v-if="display" :value="term" />
  </search-parameter-query-term>
</template>
