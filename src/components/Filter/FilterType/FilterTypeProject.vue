<script setup>
import Fuse from 'fuse.js'
import { computed } from 'vue'

import { useSearchFilter } from '@/composables/useSearchFilter'
import { useCore } from '@/composables/useCore'
import ProjectLabel from '@/components/Project/ProjectLabel'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeProjectAll from '@/components/Filter/FilterType/FilterTypeProjectAll'

defineProps({
  filter: {
    type: Object,
    required: true
  },
  hideCount: {
    type: Boolean
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

const fuse = computed(() => {
  return new Fuse(core.projects, {
    threshold: 0.1,
    shouldSort: false,
    keys: ['name', 'id']
  })
})

const fuseSome = (id) => {
  if (!query.value) {
    return true
  }
  return fuse.value.search(query.value).some(({ item }) => item.name === id)
}

const projectsWithEntries = (entries) => {
  return core.projectIds.filter(fuseSome).map((id) => {
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
  <filter-type :filter="filter" :count="selected.length">
    <template #all>
      <filter-type-project-all />
    </template>
    <template #search>
      <form-control-search v-model="query" clear-text class="filters-panel-section-filter__content__search mb-3" />
    </template>
    <template #default="{ entries }">
      <b-form-checkbox-group v-model="selected">
        <filters-panel-section-filter-entry
          v-for="{ id, count } in projectsWithEntries(entries)"
          :key="id"
          :value="id"
          :count="count"
          :hide-count="hideCount || !isProjectSelected(id)"
        >
          <project-label :project="id" hide-thumbnail />
        </filters-panel-section-filter-entry>
      </b-form-checkbox-group>
    </template>
  </filter-type>
</template>
