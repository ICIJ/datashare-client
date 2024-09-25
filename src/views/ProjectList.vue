<script setup>
import Fuse from 'fuse.js'
import { orderBy as orderArrayBy, property } from 'lodash'
import { computed, ref, onBeforeMount } from 'vue'

import PageHeader from '@/components/PageHeader/PageHeader'
import ProjectEntries from '@/components/Project/ProjectEntries/ProjectEntries'
import { useUrlParam, useUrlParamWithStore, useUrlParamsWithStore } from '@/composables/url-params'
import { useCore } from '@/composables/core'
import { useUtils } from '@/composables/utils'

const { core } = useCore()
const { isServer } = useUtils()

const searchQuery = useUrlParam('q', '')

const page = useUrlParam('page', {
  transform: (value) => parseInt(value),
  initialValue: 1
})

const perPage = useUrlParamWithStore('perPage', {
  transform: (value) => Math.max(10, parseInt(value)),
  get: () => core?.store.getters['app/getSettings']('projectList', 'perPage'),
  set: (value) => core?.store.commit('app/setSettings', { view: 'projectList', perPage: parseInt(value) })
})

const documentsCountByProject = ref({})

const fetchDocumentsCountByProject = async () => {
  const query = { match: { type: 'Document' } }
  const projectIds = core.projectIds.join(',')
  console.log(projectIds)
  const { aggregations } = await core.api.elasticsearch.countByProject(projectIds, query)
  const buckets = aggregations?.index?.buckets ?? []
  // Finally we store the count of documents by project
  buckets.forEach(({ key, doc_count: count }) => (documentsCountByProject.value[key] = count))
}

const maxExtractionDateByProject = ref({})

const fetchMaxExtractionDateByProject = async () => {
  const query = { match: { type: 'Document' } }
  const projectIds = core.projectIds.join(',')
  const { aggregations } = await core.api.elasticsearch._search(projectIds, query)
  const buckets = aggregations?.index?.buckets ?? []
  // Finally we store the max extraction date by project
  buckets.forEach(({ key, maxExtractionDate }) => (maxExtractionDateByProject.value[key] = maxExtractionDate.value))
}

onBeforeMount(fetchDocumentsCountByProject)
onBeforeMount(fetchMaxExtractionDateByProject)

const extendedProjects = computed(() => {
  return core.projects.map((project) => {
    const documentsCount = documentsCountByProject.value?.[project.name]
    const updateDate = maxExtractionDateByProject.value?.[project.name]
    return { ...project, documentsCount, updateDate }
  })
})

const fuse = computed(() => {
  const keys = ['name', 'label']
  const options = { shouldSort: false, threshold: 0.1, keys }
  return new Fuse(extendedProjects.value, options)
})

const filteredProjects = computed(() => {
  if (searchQuery.value) {
    return fuse.value.search(searchQuery.value).map(property('item'))
  }
  return extendedProjects.value
})

const sortedProjects = computed(() => {
  const [sort, order] = orderBy.value
  return orderArrayBy(filteredProjects.value, sort, order)
})

const projects = computed(() => {
  const start = (page.value - 1) * perPage.value
  return sortedProjects.value.slice(start, start + perPage.value)
})

const layout = useUrlParamWithStore('layout', {
  get: () => core?.store.getters['app/getSettings']('projectList', 'layout'),
  set: (layout) => core?.store.commit('app/setSettings', { view: 'projectList', layout })
})

const orderBy = useUrlParamsWithStore(['sort', 'order'], {
  get: () => core?.store.getters['app/getSettings']('projectList', 'orderBy'),
  set: (sort, order) => core?.store.commit('app/setSettings', { view: 'projectList', orderBy: [sort, order] })
})

const sort = computed({
  get: () => orderBy.value?.[0],
  set: (value) => (orderBy.value = [value, order.value])
})

const order = computed({
  get: () => orderBy.value?.[1],
  set: (value) => (orderBy.value = [sort.value, value])
})

const toAddRoute = computed(() => {
  return isServer.value ? null : { name: 'project.new' }
})
</script>

<template>
  <div class="project-list">
    <page-header
      v-model:searchQuery="searchQuery"
      v-model:page="page"
      :per-page="perPage"
      :total-rows="filteredProjects.length"
      :to-add="toAddRoute"
      searchable
      paginable
      search-placeholder="Search projects"
    />
    <project-entries v-model:sort="sort" v-model:order="order" :projects="projects" :layout="layout" />
  </div>
</template>
