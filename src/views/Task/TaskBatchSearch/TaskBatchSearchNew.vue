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

<template>
  <page-container fluid top class="task-documents-new">
    <page-header no-toggle-settings />
    <task-batch-search-form :name="projectName" />
  </page-container>
</template>
