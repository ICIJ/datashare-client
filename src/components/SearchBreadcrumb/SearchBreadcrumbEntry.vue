<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { computed } from 'vue'

import SearchBreadcrumbEntryOccurrences from './SearchBreadcrumbEntryOccurrences'
import SearchBreadcrumbEntryFilter from './SearchBreadcrumbEntryFilter'
import SearchBreadcrumbEntryQuery from './SearchBreadcrumbEntryQuery'

const props = defineProps({
  filter: {
    type: String
  },
  query: {
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
  },
  occurrences: {
    type: Number,
    default: 0
  },
  noCaret: {
    type: Boolean
  }
})

const entryComponent = computed(() => {
  return props.filter ? SearchBreadcrumbEntryFilter : SearchBreadcrumbEntryQuery
})

const entryAttributes = computed(() => {
  return props.filter
    ? { name: props.filter, value: props.value, icon: props.icon, color: props.color }
    : { query: props.query }
})
</script>

<template>
  <div class="search-breadcrumb-entry d-md-inline-flex">
    <component :is="entryComponent" v-bind="entryAttributes" />
    <div class="text-nowrap">
      <search-breadcrumb-entry-occurrences v-bind="entryAttributes" :occurrences="occurrences" />
      <phosphor-icon
        v-if="!noCaret"
        role="separator"
        aria-hidden="true"
        class="search-breadcrumb-entry__caret mb-2"
        size="1em"
        weight="fill"
        name="caret-right"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-breadcrumb-entry {
  align-items: center;
  padding-right: $spacer-xs;
  color: var(--bs-secondary);
}
</style>
