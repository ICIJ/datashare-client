<script setup>
import batchSearchResultsEmpty from '@/assets/images/illustrations/batch-search-results-empty.svg'
import EmptyState from '@/components/EmptyState/EmptyState'
import TaskBatchSearchQueryResultList from '@/views/Task/TaskBatchSearch/TaskBatchSearchQueryResultList'

defineProps({
  uuid: {
    type: String,
    required: true
  },
  indices: {
    type: String,
    required: true
  }
})
</script>

<template>
  <task-batch-search-query-result-list :uuid="uuid" :indices="indices">
    <template #empty>
      <empty-state :label="$t('task.batch-search-results.list.emptyStateLabel')" :image="batchSearchResultsEmpty" />
    </template>
  </task-batch-search-query-result-list>
</template>
