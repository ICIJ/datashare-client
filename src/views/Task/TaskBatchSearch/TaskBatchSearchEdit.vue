<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskBatchSearchFormEdit from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit'

defineProps({
  indices: {
    type: String,
    required: true
  },
  uuid: {
    type: String,
    required: true
  }
})
</script>

<template>
  <page-header no-toggle-settings />
  <page-container fluid>
    <task-batch-search-form-edit
      :indices="indices"
      :uuid="uuid"
    />
  </page-container>
</template>
