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
  <form-actions variant="outline-dark" class="justify-content-start">
    <search-results-actions-select-all
      :count="count"
      :indeterminate="indeterminate"
      :selected="selected"
      @update:selected="emit('update:selected', $event)"
      @update:indeterminate="emit('update:indeterminate', $event)"
    />
    <search-results-actions-star @click="emit('star')" />
    <search-results-actions-tag @click="emit('tag')" />
    <search-results-actions-download @click="emit('download')" />
    <search-results-actions-recommend @click="emit('recommend')" />
  </form-actions>
</template>
