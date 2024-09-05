<script setup>
import ProjectEntriesTableHead from './ProjectEntriesTableHead'
import ProjectEntriesTableBody from './ProjectEntriesTableBody'

import PageTable from '@/components/PageTable/PageTable'

defineProps({
  projects: {
    type: Array
  }
})
</script>
<template>
  <div class="project-entries-table container-fluid">
    <page-table>
      <template #colgroup>
        <col style="min-width: 200px" />
        <col style="min-width: 200px" />
      </template>
      <template #thead>
        <project-entries-table-head />
      </template>
      <project-entries-table-body :projects="projects" />
    </page-table>
  </div>
</template>
