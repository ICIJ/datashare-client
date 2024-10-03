<script setup>
import { computed } from 'vue'

import { useCore } from '@/composables/core'
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
</script>

<template>
  <div class="project-view-overview">
    <page-container fluid>
      <div class="bg-tertiary-subtle rounded-1 p-4">
        <project-jumbotron :project="project" v-model:pinned="pinned" />
        <search-bar class="my-4 py-3 mx-3" size="lg" :indices="indices" hide-field-dropdown hide-projects-dropdown />
        <tab-group-navigation class="mx-3">
          <tab-group-navigation-entry icon="chart-bar" :to="{ name: 'project.view.overview.insights' }">
            {{ $t('projectView.nav.insights') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="tree-structure" disabled>
            {{ $t('projectView.nav.paths') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="polygon" disabled>
            {{ $t('projectView.nav.graph') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="circles-three-plus" disabled>
            {{ $t('projectView.nav.details') }}
          </tab-group-navigation-entry>
          <tab-group-navigation-entry icon="clock-counter-clockwise" disabled>
            {{ $t('projectView.nav.history') }}
          </tab-group-navigation-entry>
        </tab-group-navigation>
        <router-view />
      </div>
    </page-container>
  </div>
</template>
