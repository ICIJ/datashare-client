<script setup>
import { computed, ref, watch } from 'vue'

import { useCore } from '@/composables/core'
import { useWait } from '@/composables/wait'
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
const { waitFor } = useWait()

const project = computed(() => {
  return core.findProject(props.name)
})

const pinned = computed({
  get: () => {
    return core.store.getters['app/isProjectPinned'](props.name)
  },
  set: (pinned) => {
    if (pinned) {
      core.store.commit('app/pinProject', props.name)
    } else {
      core.store.commit('app/unpinProject', props.name)
    }
  }
})

const loaderId = 'loader-project-view-overview'

const fetchDocumentsCount = async () => {
  const { name: index } = props
  const { count } = await core.api.elasticsearch.count({ index })
  return count
}

const fetchDocumentsCountWithLoader = waitFor(loaderId, fetchDocumentsCount)

const hasDocuments = ref(false)

watch(
  () => props.name,
  async () => {
    hasDocuments.value = !!(await fetchDocumentsCountWithLoader())
  },
  { immediate: true }
)
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

        <project-jumbotron v-model:pinned="pinned" :project="project" />
        <search-bar class="my-4 py-3 mx-3" size="lg" :indices="indices" hide-field-dropdown hide-projects-dropdown />
        <tab-group-navigation class="mx-3" nowrap>
          <tab-group-navigation-entry icon="chart-bar" :to="{ name: 'project.view.overview.insights' }">
            {{ $t('projectViewOverview.nav.insights') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="tree-structure" disabled>
            {{ $t('projectViewOverview.nav.paths') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="polygon" disabled>
            {{ $t('projectViewOverview.nav.graph') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="circles-three-plus" :to="{ name: 'project.view.overview.details' }">
            {{ $t('projectViewOverview.nav.details') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="clock-counter-clockwise" disabled>
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
          :action-to="{ name: 'task.analysis.list' }"
        />
      </v-wait>
    </page-container>
  </div>
</template>
