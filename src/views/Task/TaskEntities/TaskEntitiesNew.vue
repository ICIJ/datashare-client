<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeaderNav from '@/components/PageHeader/PageHeaderNav'
import TaskEntitiesForm from '@/components/Task/TaskEntities/TaskEntitiesForm'

defineProps({
  project: {
    type: String,
    default: null
  }
})
</script>

<template>
  <page-container fluid deck class="task-entities-new">
    <page-header-nav no-toggle-settings />
    <task-entities-form :project="project" />
  </page-container>
</template>
