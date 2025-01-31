<script setup>
import { computed, ref, watch, toRef } from 'vue'
import { get } from 'lodash'

import { useCore } from '@/composables/core'
import { useWait } from '@/composables/wait'
import { useProjectPinned } from '@/composables/project'
import EmptyState from '@/components/EmptyState/EmptyState'
import PageContainer from '@/components/PageContainer/PageContainer'
import ProjectJumbotron from '@/components/Project/ProjectJumbotron/ProjectJumbotron'
import SearchBar from '@/components/Search/SearchBar/SearchBar'
import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'

const indices = computed(() => {
  return [props.name]
})

const props = defineProps({
  name: {
    type: String
  }
})

const { core } = useCore()
const { waitFor, loaderId } = useWait()

const params = computed(() => {
  return { name: props.name }
})

const project = computed(() => {
  return core.findProject(props.name)
})

const { pinned } = useProjectPinned(project)
const hasDocuments = ref(false)
const lastIndexingDate = ref(null)

const fetchDocumentsCount = async () => {
  const { name: index } = props
  const { count } = await core.api.elasticsearch.count({ index })
  return count
}

const fetchLastIndexingDate = async () => {
  const query = { match: { type: 'Document' } }
  const { name: index } = props
  const { aggregations } = await core.api.elasticsearch.maxExtractionDateByProject(index, query)
  return get(aggregations, 'index.buckets.0.maxExtractionDate.value', null)
}

const fetch = waitFor(loaderId, async () => {
  hasDocuments.value = !!(await fetchDocumentsCount())
  lastIndexingDate.value = await fetchLastIndexingDate()
})

watch(toRef(props, 'name'), fetch, { immediate: true })
</script>

<template>
  <div class="project-view-overview">
    <page-container fluid>
      <v-wait class="bg-tertiary-subtle rounded-1 p-4" :for="loaderId">
        <template #waiting>
          <div class="text-center py-5">
            <phosphor-icon name="circle-notch" spin size="2em" />
          </div>
        </template>

        <project-jumbotron
          v-model:pinned="pinned"
          class="mx-3"
          :project="project"
          :last-indexing-date="lastIndexingDate"
        />
        <search-bar class="my-4 py-3 mx-3" size="lg" :indices="indices" hide-field-dropdown hide-projects-dropdown />
        <tab-group-navigation class="mx-3" nowrap>
          <tab-group-navigation-entry icon="chart-bar" :to="{ name: 'project.view.overview.insights', params }">
            {{ $t('projectViewOverview.nav.insights') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="tree-structure" :to="{ name: 'project.view.overview.paths', params }">
            {{ $t('projectViewOverview.nav.paths') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="polygon" :to="{ name: 'project.view.overview.graph', params }">
            {{ $t('projectViewOverview.nav.graph') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="info" :to="{ name: 'project.view.overview.details', params }">
            {{ $t('projectViewOverview.nav.details') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry
            icon="clock-counter-clockwise"
            :to="{ name: 'project.view.overview.history', params }"
          >
            {{ $t('projectViewOverview.nav.history') }}
          </tab-group-navigation-entry>
        </tab-group-navigation>
        <router-view v-if="hasDocuments" :key="name" />
        <empty-state
          v-else
          :label="$t('projectViewOverview.emptyStateLabel')"
          class="my-5"
          action-icon="plus"
          :action-label="$t('projectViewOverview.emptyStateAction')"
          :action-to="{ name: 'task.documents.new', query: { projectName: project.name } }"
        />
      </v-wait>
    </page-container>
  </div>
</template>
