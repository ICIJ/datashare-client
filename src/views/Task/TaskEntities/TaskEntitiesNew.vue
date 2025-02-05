<template>
  <page-header no-toggle-settings />
  <div class="task-entities-new">
    <page-container fluid>
      <task-entities-form :project-name="projectName" />
    </page-container>
  </div>
</template>

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
