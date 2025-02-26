<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskDocumentsForm from '@/components/Task/TaskDocuments/TaskDocumentsForm'

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
    <task-documents-form :project-name="projectName" />
  </page-container>
</template>
