<template>
  <page-header no-toggle-settings />
  <div class="project-new">
    <page-container fluid>
      <task-entities-form :project-name="project" />
    </page-container>
  </div>
</template>

<script setup>
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import { useUrlParam } from '@/composables/url-params'
import TaskEntitiesForm from '@/components/Task/TaskEntities/TaskEntitiesForm'
const project = useUrlParam('project', null)
</script>
