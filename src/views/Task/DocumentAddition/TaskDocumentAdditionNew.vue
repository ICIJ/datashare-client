<template>
  <page-header no-toggle-settings />
  <div class="project-new">
    <page-container fluid>
      <task-document-addition-form :project-name="project" />
    </page-container>
  </div>
</template>

<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskDocumentAdditionForm from '@/components/Task/TaskDocumentAddition/TaskDocumentAdditionForm'
import { useUrlParam } from '@/composables/url-params'
const project = useUrlParam('project', null)
</script>
