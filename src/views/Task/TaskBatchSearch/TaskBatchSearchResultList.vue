<script setup>
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
  <task-batch-search-query-result-list :uuid="uuid" :indices="indices" />
</template>
