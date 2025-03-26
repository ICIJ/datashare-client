<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeaderNav from '@/components/PageHeader/PageHeaderNav'
import TaskBatchSearchForm from '@/components/Task/TaskBatchSearch/TaskBatchSearchForm'

defineProps({
  projectName: {
    type: String,
    default: null
  }
})
</script>

<template>
  <page-container fluid deck class="task-documents-new">
    <page-header-nav no-toggle-settings />
    <task-batch-search-form :name="projectName" />
  </page-container>
</template>
