<template>
  <page-header no-toggle-settings />
  <div class="task-documents-new">
    <page-container fluid>
      <task-batch-search-form :name="projectName" />
    </page-container>
  </div>
</template>

<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskBatchSearchForm from '@/components/Task/TaskBatchSearch/TaskBatchSearchForm'

defineProps({
  projectName: {
    type: String,
    default: null
  }
})
</script>
