<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskDocumentsForm from '@/components/Task/TaskDocuments/TaskDocumentsForm'

defineProps({
  project: {
    type: String,
    default: null
  }
})
</script>

<template>
  <div class="task-documents-new">
    <page-header no-toggle-settings />
    <page-container fluid>
      <task-documents-form :project="project" />
    </page-container>
  </div>
</template>
