<template>
  <page-header no-toggle-settings />
  <div class="project-new">
    <page-container fluid>
      <task-document-addition-form />
    </page-container>
  </div>
</template>

<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import TaskDocumentAdditionForm from '@/components/Task/TaskDocumentAddition/TaskDocumentAdditionForm'
import PageHeader from '@/components/PageHeader/PageHeader'
</script>
