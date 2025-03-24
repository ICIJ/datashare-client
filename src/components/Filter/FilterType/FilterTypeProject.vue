<script setup>
import { computed } from 'vue'

import { useSearchFilter } from '@/composables/useSearchFilter'
import { useCore } from '@/composables/useCore'
import ProjectLabel from '@/components/Project/ProjectLabel'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeProjectAll from '@/components/Filter/FilterType/FilterTypeProjectAll'

defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const { computedProjects, allProjectsSelected } = useSearchFilter()
const { core } = useCore()
const query = defineModel('query', { type: String, default: '' })

const selectedProjects = computedProjects()

const selected = computed({
  get() {
    return allProjectsSelected.value ? [] : selectedProjects.value
  },
  set(value) {
    selectedProjects.value = value.length === 0 ? core.projectIds : value
  }
})

const projectsWithEntries = (entries) => {
  return core.projectIds.map((id) => {
    const entry = entries.find(({ value }) => value === id)
    const count = entry?.item?.doc_count ?? null
    return { id, count }
  })
}

const isProjectSelected = (id) => {
  return selected.value.includes(id)
}
</script>

<template>
  <filter-type v-model:query="query" :filter="filter" :count="selected.length">
    <template #all>
      <filter-type-project-all />
    </template>
    <template #default="{ entries }">
      <b-form-checkbox-group v-model="selected">
        <filters-panel-section-filter-entry
          v-for="{ id, count } in projectsWithEntries(entries)"
          :key="id"
          :value="id"
          :count="count"
          :hide-count="!isProjectSelected(id)"
        >
          <project-label :project="id" hide-thumbnail />
        </filters-panel-section-filter-entry>
      </b-form-checkbox-group>
    </template>
  </filter-type>
</template>
