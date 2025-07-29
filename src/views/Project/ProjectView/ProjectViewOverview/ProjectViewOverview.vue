<script setup>
import { computed, ref, watch, toRef } from 'vue'
import { get } from 'lodash'
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/useCore'
import { useWait } from '@/composables/useWait'
import { useProjectPinned } from '@/composables/useProjectPinned'
import AppSpinner from '@/components/AppSpinner/AppSpinner'
import AppWait from '@/components/AppWait/AppWait'
import EmptyState from '@/components/EmptyState/EmptyState'
import ProjectJumbotron from '@/components/Project/ProjectJumbotron/ProjectJumbotron'
import SearchBar from '@/components/Search/SearchBar/SearchBar'
import TabGroupNavigation from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigation'
import TabGroupNavigationEntry from '@/components/TabGroup/TabGroupNavigation/TabGroupNavigationEntry'
import { MODE_NAME } from '@/mode'

const indices = computed(() => {
  return [props.name]
})

const props = defineProps({
  name: {
    type: String
  }
})

const { t } = useI18n()
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

const fetch = waitFor(async () => {
  hasDocuments.value = !!(await fetchDocumentsCount())
  lastIndexingDate.value = await fetchLastIndexingDate()
})

watch(toRef(props, 'name'), fetch, { immediate: true })
</script>

<template>
  <div class="project-view-overview">
    <app-wait
      class="bg-tertiary-subtle rounded-1 p-1 px-md-4 py-4 mb-3"
      :for="loaderId"
    >
      <template #waiting>
        <div class="text-center py-5">
          <app-spinner size="2em" />
        </div>
      </template>
      <project-jumbotron
        v-model:pinned="pinned"
        class="mx-3"
        :project="project"
        :last-indexing-date="lastIndexingDate"
      />
      <search-bar
        :indices="indices"
        class="my-4 py-3 mx-3"
        clear-filters
        hide-field-dropdown
        hide-projects-dropdown
        show-submit
        size="lg"
      />
      <tab-group-navigation
        class="mx-3"
        nowrap
      >
        <tab-group-navigation-entry
          icon="chart-bar"
          :to="{ name: 'project.view.overview.insights', params }"
        >
          {{ t('projectViewOverview.nav.insights') }}
        </tab-group-navigation-entry>
        <tab-group-navigation-entry
          icon="tree-structure"
          :to="{ name: 'project.view.overview.paths', params }"
        >
          {{ t('projectViewOverview.nav.paths') }}
        </tab-group-navigation-entry>
        <tab-group-navigation-entry
          icon="polygon"
          :to="{ name: 'project.view.overview.graph', params }"
        >
          {{ t('projectViewOverview.nav.graph') }}
        </tab-group-navigation-entry>
        <tab-group-navigation-entry
          icon="info"
          :to="{ name: 'project.view.overview.details', params }"
        >
          {{ t('projectViewOverview.nav.details') }}
        </tab-group-navigation-entry>
        <tab-group-navigation-entry
          icon="clock-counter-clockwise"
          :to="{ name: 'project.view.overview.history', params }"
        >
          {{ t('projectViewOverview.nav.history') }}
        </tab-group-navigation-entry>
      </tab-group-navigation>
      <router-view
        v-if="hasDocuments"
        :key="name"
      />
      <empty-state
        v-else
        :label="t('projectViewOverview.emptyStateLabel')"
        class="my-5"
        action-icon="plus"
        :action-label="t('projectViewOverview.emptyStateAction')"
        :action-to="{ name: 'task.documents.new', query: { project: project.name } }"
        :action-modes="[MODE_NAME.LOCAL, MODE_NAME.EMBEDDED]"
      />
    </app-wait>
  </div>
</template>
