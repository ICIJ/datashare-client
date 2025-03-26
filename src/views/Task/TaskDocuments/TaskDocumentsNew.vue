<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeaderNav from '@/components/PageHeader/PageHeaderNav'
import TaskDocumentsForm from '@/components/Task/TaskDocuments/TaskDocumentsForm'

defineProps({
  project: {
    type: String,
    default: null
  }
})
</script>

<template>
  <page-container fluid deck class="task-documents-new">
    <page-header-nav no-toggle-settings />
    <task-documents-form :project="project" />
  </page-container>
</template>
