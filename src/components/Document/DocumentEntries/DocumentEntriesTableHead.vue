<script setup>
import { computed, toValue } from 'vue'

import PageTableTh from '@/components/PageTable/PageTableTh'
import { useSearchProperties } from '@/composables/useSearchProperties'

const props = defineProps({
  compactBreakpoint: {
    type: String,
    default: 'md'
  },
  selectMode: {
    type: Boolean,
    default: false
  },
  properties: {
    type: Array,
    default: () => ['title', 'thumbnail']
  }
})

const { fields } = useSearchProperties()

const visibleFields = computed(() => {
  return fields.filter((field) => {
    return field.required || props.properties.includes(field.key)
  })
})
</script>

<template>
  <page-table-th v-for="field in visibleFields" :key="field" :label="toValue(field.text)" :icon="field.icon" />
  <page-table-th :label="$t('documentEntriesTableHead.action')" hide-label />
</template>
