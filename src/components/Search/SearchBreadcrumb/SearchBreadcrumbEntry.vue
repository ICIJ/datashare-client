<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { computed } from 'vue'
import { pick } from 'lodash'

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
  size: {
    type: String
  },
  occurrences: {
    type: Number,
    default: 0
  },
  noCaret: {
    type: Boolean
  },
  noOccurrences: {
    type: Boolean
  },
  noIcon: {
    type: Boolean
  }
})

const entryComponent = computed(() => {
  return props.filter ? SearchBreadcrumbEntryFilter : SearchBreadcrumbEntryQuery
})

const entryAttributes = computed(() => {
  return props.filter
    ? { name: props.filter, ...pick(props, ['value', 'icon', 'color', 'noIcon', 'size']) }
    : pick(props, ['query', 'noIcon', 'size'])
})
</script>

<template>
  <div class="search-breadcrumb-entry d-inline-flex flex-wrap">
    <component :is="entryComponent" v-bind="entryAttributes" />
    <div class="text-nowrap">
      <search-breadcrumb-entry-occurrences
        v-if="!noOccurrences"
        class="search-breadcrumb-entry__occurences"
        v-bind="entryAttributes"
        :occurrences="occurrences"
      />
      <phosphor-icon
        v-if="!noCaret"
        role="separator"
        aria-hidden="true"
        class="search-breadcrumb-entry__caret"
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
  color: var(--bs-secondary);
}
</style>
