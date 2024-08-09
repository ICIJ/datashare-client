<script setup>
import SearchResultsActionsDownload from './SearchResultsActionsDownload'
import SearchResultsActionsRecommend from './SearchResultsActionsRecommend'
import SearchResultsActionsSelectAll from './SearchResultsActionsSelectAll'
import SearchResultsActionsStar from './SearchResultsActionsStar'
import SearchResultsActionsTag from './SearchResultsActionsTag'

import FormActions from '@/components/Form/FormActions/FormActions'

defineProps({
  selected: {
    type: Boolean
  },
  indeterminate: {
    type: Boolean
  },
  count: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  /**
   * Update the 'selected' prop value
   * @event update:selected
   * @property {boolean} selected - new value set
   **/
  'update:selected',
  /** Update the 'indeterminate' prop value
   * @event update:indeterminate
   * @property {boolean} indeterminate - new value set
   */
  'update:indeterminate',
  /** Mark the selected documents as stared */
  'star',
  /** Tag the selected documents */
  'tag',
  /** Queue the selected documents for download */
  'download',
  /** Mark the selected documents as recommend */
  'recommend'
])
</script>

<template>
  <form-actions variant="outline-dark" class="justify-content-start flex-nowrap flex-md-wrap flex-truncate" compact-auto>
    <template #start="{ isCompact }">
      <search-results-actions-select-all
        class="me-auto me-md-0"
        :variant="isCompact ? 'link' : 'outline-dark'"
        :count="count"
        :indeterminate="indeterminate"
        :selected="selected"
        @update:selected="emit('update:selected', $event)"
        @update:indeterminate="emit('update:indeterminate', $event)"
      />
    </template>
    <template #compact="{ isCompact }">
      <search-results-actions-star :hide-label="isCompact" @click="emit('star')" />
    </template>
    <search-results-actions-tag @click="emit('tag')" />
    <search-results-actions-download @click="emit('download')" />
    <search-results-actions-recommend @click="emit('recommend')" />
  </form-actions>
</template>
