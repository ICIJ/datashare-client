<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import SearchBreadcrumbEntryOccurrences from '@/components/Search/SearchBreadcrumb/SearchBreadcrumbEntryOccurrences'
import SearchParameter from '@/components/Search/SearchParameter/SearchParameter'

defineProps({
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
</script>

<template>
  <div class="search-breadcrumb-entry d-inline-flex flex-wrap">
    <search-parameter
      :color="color"
      :icon="icon"
      :filter="filter"
      :no-icon="noIcon"
      :query="query"
      :size="size"
      :value="value"
    />
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
