<template>
  <page-header no-toggle-settings />
  <div class="task-documents-new">
    <page-container fluid>
      <task-documents-form :project-name="projectName" />
    </page-container>
  </div>
</template>

<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskDocumentsForm from '@/components/Task/TaskDocuments/TaskDocumentsForm'

defineProps({ projectName: String })
</script>
