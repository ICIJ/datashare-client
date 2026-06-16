<script setup>
import { onBeforeMount, ref } from 'vue'

import AppSpinner from '@/components/AppSpinner/AppSpinner'
import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import TaskBatchSearchFormEdit from '@/components/Task/TaskBatchSearch/TaskBatchSearchFormEdit'
import { useCore } from '@/composables/useCore'

const { indices, uuid } = defineProps({
  indices: {
    type: String,
    required: true
  },
  uuid: {
    type: String,
    required: true
  }
})

const core = useCore()
const batchSearch = ref(null)

const breadcrumbRoutes = [
  { name: 'task' },
  { name: 'task.batch-search.list' },
  { name: 'task.batch-search-queries.list' },
  { name: 'task.batch-search.edit' }
]

async function fetchBatchSearch() {
  batchSearch.value = await core.api.getBatchSearch(uuid)
}

onBeforeMount(fetchBatchSearch)
</script>

<template>
  <!-- eslint-disable vue/valid-v-slot -->
  <page-header
    no-toggle-settings
    :breadcrumb-routes="breadcrumbRoutes"
  >
    <template #entry-label(task.batch-search-queries.list)>
      <template v-if="batchSearch">
        {{ batchSearch.name }}
      </template>
      <app-spinner v-else />
    </template>
  </page-header>
  <page-container fluid>
    <task-batch-search-form-edit
      :indices="indices"
      :uuid="uuid"
    />
  </page-container>
</template>
