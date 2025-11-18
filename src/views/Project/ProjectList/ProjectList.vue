<script setup>
import Fuse from 'fuse.js'
import { orderBy as orderArrayBy, property } from 'lodash'
import { computed, ref, onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'

import PageContainer from '@/components/PageContainer/PageContainer'
import PageHeader from '@/components/PageHeader/PageHeader'
import ProjectEntries from '@/components/Project/ProjectEntries/ProjectEntries'
import RowPaginationProjects from '@/components/RowPagination/RowPaginationProjects'
import { awaitWhenever } from '@/composables/awaitWhenever'
import { useUrlParam } from '@/composables/useUrlParam'
import { useUrlParamWithStore } from '@/composables/useUrlParamWithStore'
import { useUrlParamsWithStore } from '@/composables/useUrlParamsWithStore'
import { useCore } from '@/composables/useCore'
import { useToast } from '@/composables/useToast'
import { useWait } from '@/composables/useWait'
import { useAppStore } from '@/store/modules'
import useMode from '@/composables/useMode'

const DOCUMENTS_COUNT_FIELD = 'documentsCount'
const MAX_EXTRACTION_DATE_FIELD = 'updateDate'

const { t } = useI18n()
const core = useCore()
const { toast } = useToast()
const { isServer } = useMode()
const { waitFor, isLoading } = useWait()
const appStore = useAppStore()
const searchQuery = useUrlParam('q', '')

const page = useUrlParam('page', {
  transform: value => parseInt(value),
  initialValue: 1
})

const perPage = useUrlParamWithStore('perPage', {
  transform: value => Math.max(10, parseInt(value)),
  get: () => appStore.getSettings('projectList', 'perPage'),
  set: value => appStore.setSettings('projectList', { perPage: parseInt(value) })
})

const documentsCountByProject = ref({})
const isSortedByCount = computed(() => orderBy.value[0] === DOCUMENTS_COUNT_FIELD)
const isSortedByMaxExtractionDate = computed(() => orderBy.value[0] === MAX_EXTRACTION_DATE_FIELD)

const fetchDocumentsCountByProject = async () => {
  const query = { match: { type: 'Document' } }
  const projectIds = core.projectIds.join(',')
  const { aggregations } = await core.api.elasticsearch.countByProject(projectIds, query)
  const buckets = aggregations?.index?.buckets ?? []
  // Finally we store the count of documents by project
  buckets.forEach(({ key, doc_count: count }) => (documentsCountByProject.value[key] = count))
}

const maxExtractionDateByProject = ref({})

const fetchMaxExtractionDateByProject = async () => {
  const query = { match: { type: 'Document' } }
  const projectIds = core.projectIds.join(',')
  const { aggregations } = await core.api.elasticsearch.maxExtractionDateByProject(projectIds, query)
  const buckets = aggregations?.index?.buckets ?? []
  // Finally we store the max extraction date by project
  buckets.forEach(({ key, maxExtractionDate }) => (maxExtractionDateByProject.value[key] = maxExtractionDate.value))
}

const fetch = waitFor(async () => {
  try {
    await awaitWhenever(fetchDocumentsCountByProject, isSortedByCount)
    await awaitWhenever(fetchMaxExtractionDateByProject, isSortedByMaxExtractionDate)
  }
  catch {
    toast.error('Unable to fetch projects details.')
  }
})

onBeforeMount(fetch)

const extendedProjects = computed(() => {
  return core.projects.map(({ name, ...project }) => {
    const documentsCount = documentsCountByProject.value?.[name] ?? 0
    const updateDate = new Date(maxExtractionDateByProject.value?.[name] ?? project.updateDate ?? project.creationDate)
    return { ...project, name, [DOCUMENTS_COUNT_FIELD]: documentsCount, [MAX_EXTRACTION_DATE_FIELD]: updateDate }
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
  get: () => appStore.getSettings('projectList', 'layout'),
  set: layout => appStore.setSettings('projectList', { layout })
})

const orderBy = useUrlParamsWithStore(['sort', 'order'], {
  get: () => appStore.getSettings('projectList', 'orderBy'),
  set: (sort, order) => appStore.setSettings('projectList', { orderBy: [sort, order] })
})

const sort = computed({
  get: () => orderBy.value?.[0],
  set: value => (orderBy.value = [value, order.value])
})

const order = computed({
  get: () => orderBy.value?.[1],
  set: value => (orderBy.value = [sort.value, value])
})

const addToRoute = computed(() => {
  return isServer.value ? null : { name: 'project.new' }
})
</script>

<template>
  <div class="project-list">
    <page-header
      v-model:search-query="searchQuery"
      v-model:page="page"
      :add-to="addToRoute"
      :add-label="t('projectNew.title')"
      :per-page="perPage"
      :total-rows="filteredProjects.length"
      searchable
      paginable
      sticky
      :search-placeholder="t('projectList.searchPlaceholder')"
    >
      <template #pagination="{ totalRows }">
        <row-pagination-projects
          v-model="page"
          :total-rows="totalRows"
          :per-page="perPage"
        />
      </template>
    </page-header>
    <page-container fluid>
      <project-entries
        v-model:sort="sort"
        v-model:order="order"
        :loading="isLoading"
        :projects="projects"
        :layout="layout"
      />
    </page-container>
  </div>
</template>
