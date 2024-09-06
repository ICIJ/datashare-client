<script setup>
import Fuse from 'fuse.js'
import { orderBy as orderArrayBy, property } from 'lodash'
import { computed, ref, onMounted } from 'vue'

import PageHeader from '@/components/PageHeader/PageHeader'
import ProjectEntries from '@/components/Project/ProjectEntries/ProjectEntries'
import { useCore } from '@/composables/core'

const { core } = useCore()

const searchQuery = ref('')

const page = ref(1)

const perPage = computed(() => {
  return core?.store.getters['app/getSettings']('projectList', 'perPage')
})

const documentsCountByProject = ref({})

const fetchDocumentsCountByProject = async () => {
  const body = { match: { type: 'Document' } }
  const projectIds = core.projectIds.join(',')
  const { aggregations } = await core.api.elasticsearch.countByProject(projectIds, body)
  const buckets = aggregations?.index?.buckets ?? []
  // Finally we store the count of documents by project
  buckets.forEach(({ key, doc_count: count }) => (documentsCountByProject.value[key] = count))
}

onMounted(fetchDocumentsCountByProject)

const fuse = computed(() => {
  const keys = ['name', 'label']
  const options = { shouldSort: false, keys }
  return new Fuse(core.projects, options)
})

const filteredProjects = computed(() => {
  if (searchQuery.value) {
    return fuse.value.search(searchQuery.value).map(property('item'))
  }
  return core.projects
})

const sortedProjects = computed(() => {
  const [sort, order] = orderBy.value
  const extended = filteredProjects.value.map((project) => {
    const documentsCount = documentsCountByProject.value[project.name] ?? 0
    return { ...project, documentsCount }
  })
  return orderArrayBy(extended, sort, order)
})

const projects = computed(() => {
  const start = (page.value - 1) * perPage.value
  return sortedProjects.value.slice(start, start + perPage.value)
})

const layout = computed(() => {
  return core?.store.getters['app/getSettings']('projectList', 'layout')
})

const orderBy = computed(() => {
  return core?.store.getters['app/getSettings']('projectList', 'orderBy')
})

const sort = computed({
  get: () => orderBy.value?.[0],
  set: (value) => core?.store.commit('app/setSettings', { view: 'projectList', orderBy: [value, order.value] })
})

const order = computed({
  get: () => orderBy.value?.[1],
  set: (value) => core?.store.commit('app/setSettings', { view: 'projectList', orderBy: [sort.value, value] })
})
</script>

<template>
  <div class="project-list">
    <page-header
      v-model:searchQuery="searchQuery"
      v-model:page="page"
      :per-page="perPage"
      :total-rows="filteredProjects.length"
      :to-add="{ name: 'project.new' }"
      searchable
      paginable
      search-placeholder="Search projects"
    />
    <project-entries v-model:sort="sort" v-model:order="order" :projects="projects" :layout="layout" />
  </div>
</template>
