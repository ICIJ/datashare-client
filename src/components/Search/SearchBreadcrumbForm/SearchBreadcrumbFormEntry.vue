<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur-next'
import IPhCaretRightFill from '~icons/ph/caret-right-fill'

import SearchBreadcrumbFormEntryOccurrences from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormEntryOccurrences'
import SearchParameter from '@/components/Search/SearchParameter/SearchParameter'

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
    type: [String, Object, Array],
    default: null
  },
  size: {
    type: String
  },
  occurrences: {
    type: Number,
    default: null
  },
  previousOccurrences: {
    type: Number,
    default: null
  },
  noCaret: {
    type: Boolean
  },
  noOccurrences: {
    type: Boolean
  },
  noIcon: {
    type: Boolean
  },
  noXIcon: {
    type: Boolean
  }
})

const emit = defineEmits(['click:x'])

const showOccurences = computed(() => {
  return !props.noOccurrences && props.occurrences !== null
})

const showCaret = computed(() => {
  return !props.noCaret && props.occurrences !== null
})
</script>

<template>
  <div class="search-breadcrumb-form-entry d-inline-flex flex-wrap">
    <search-parameter
      :color="color"
      :icon="icon"
      :filter="filter"
      :no-icon="noIcon"
      :query="query"
      :size="size"
      :value="value"
      :no-x-icon="noXIcon"
      @click:x="emit('click:x', $event)"
    />
    <div class="text-nowrap">
      <search-breadcrumb-form-entry-occurrences
        v-if="showOccurences"
        class="search-breadcrumb-form-entry__occurences"
        :occurrences="occurrences"
        :previous-occurrences="previousOccurrences"
      />
      <app-icon
        v-if="showCaret"
        role="separator"
        aria-hidden="true"
        class="search-breadcrumb-form-entry__caret"
        size="1em"
        :name="IPhCaretRightFill"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-breadcrumb-form-entry {
  align-items: center;
  color: var(--bs-secondary);
}
</style>
