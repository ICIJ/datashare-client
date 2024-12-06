<script setup>
import PageTableTh from '@/components/PageTable/PageTableTh'
import { useSearchSettings } from '@/composables/search-settings'

const { propertiesLabel, propertiesIcon } = useSearchSettings()

defineProps({
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
</script>

<template>
  <page-table-th
    v-for="property in properties"
    :key="property"
    :label="propertiesLabel[property]"
    :icon="propertiesIcon[property]"
  />
  <page-table-th label="Action" hide-label />
</template>
