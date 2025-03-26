<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskEntitiesForm from '@/components/Task/TaskEntities/TaskEntitiesForm'

defineProps({
  project: {
    type: String,
    default: null
  }
})
</script>

<template>
  <page-header no-toggle-settings />
  <page-container fluid>
    <task-entities-form :project="project" />
  </page-container>
</template>
