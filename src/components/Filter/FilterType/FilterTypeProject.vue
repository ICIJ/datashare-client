<script setup>
import { useSearchFilter } from '@/composables/search-filter'
import { useCore } from '@/composables/core'
import ProjectLabel from '@/components/Project/ProjectLabel'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import FilterType from '@/components/Filter/FilterType/FilterType'

defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const { computedProjects } = useSearchFilter()
const { core } = useCore()
const query = defineModel('query', { type: String, default: '' })

const selected = computedProjects()

const projectsWithEntries = (entries) => {
  return core.projectIds.map((id) => {
    const entry = entries.find(({ value }) => value === id)
    const count = entry?.item?.doc_count ?? null
    return { id, count }
  })
}

const isProjectDisabled = (id) => {
  return selected.value.length === 1 && selected.value[0] === id
}

const isProjectSelected = (id) => {
  return selected.value.includes(id)
}
</script>

<template>
  <filter-type v-model:query="query" :filter="filter" :count="selected.length">
    <template #default="{ entries }">
      <b-form-checkbox-group v-model="selected">
        <filters-panel-section-filter-entry
          v-for="{ id, count } in projectsWithEntries(entries)"
          :key="id"
          :value="id"
          :count="count"
          :disabled="isProjectDisabled(id)"
          :hide-count="!isProjectSelected(id)"
        >
          <project-label :project="id" hide-thumbnail />
        </filters-panel-section-filter-entry>
      </b-form-checkbox-group>
    </template>
  </filter-type>
</template>
