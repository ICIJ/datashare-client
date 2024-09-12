<script setup>
import ProjectEntriesTableHead from './ProjectEntriesTableHead'
import ProjectEntriesTableBody from './ProjectEntriesTableBody'

import PageContainer from '@/components/PageContainer/PageContainer'
import PageTable from '@/components/PageTable/PageTable'

const sort = defineModel('sort', { type: String, default: null })
const order = defineModel('order', { type: String, default: 'desc' })

defineProps({
  projects: {
    type: Array
  }
})
</script>
<template>
  <page-container fluid class="project-entries-table">
    <page-table v-model:sort="sort" v-model:order="order">
      <template #colgroup>
        <col style="min-width: 200px" />
        <col style="min-width: 200px" />
      </template>
      <template #thead>
        <project-entries-table-head />
      </template>
      <project-entries-table-body :projects="projects" />
    </page-table>
  </page-container>
</template>
