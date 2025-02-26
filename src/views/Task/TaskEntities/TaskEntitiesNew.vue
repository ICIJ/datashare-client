<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskEntitiesForm from '@/components/Task/TaskEntities/TaskEntitiesForm'

defineProps({
  projectName: {
    type: String,
    default: null
  }
})
</script>

<template>
  <page-container fluid top class="task-entities-new">
    <page-header no-toggle-settings />
    <task-entities-form :project-name="projectName" />
  </page-container>
</template>
