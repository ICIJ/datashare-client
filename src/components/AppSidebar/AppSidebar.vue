<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AppSidebarFooter from './AppSidebarFooter'
import AppSidebarSection from './AppSidebarSection'
import AppSidebarSectionEntry from './AppSidebarSectionEntry'
import AppSidebarToggler from './AppSidebarToggler'
import AppSidebarClose from './AppSidebarClose'

import { Api } from '@/api'
import { useCore } from '@/composables/core'
import ProjectLabel from '@/components/Project/ProjectLabel'
import VersionNumber from '@/components/VersionNumber'
import settings from '@/utils/settings'

const { core } = useCore()
const { t } = useI18n()

const projects = computed(() => {
  return core.projects
})

const compact = computed({
  get: () => core.store.state.app.sidebar.compact,
  set: (value) => core.store.dispatch('app/toggleSidebarCompact', value)
})

const closed = computed({
  get: () => core.store.state.app.sidebar.closed,
  set: (value) => core.store.dispatch('app/toggleSidebarClosed', value)
})

const classList = computed(() => {
  return {
    'app-sidebar--compact': compact.value,
    'app-sidebar--closed': closed.value
  }
})

const signOutLink = computed(() => {
  return Api.getFullUrl(import.meta.env.VITE_DS_AUTH_SIGNOUT)
})

const helpLink = computed(() => {
  return core.config.get('helpLink', settings.helpLink)
})

const isServerMode = computed(() => {
  return core.config && core.config.get('mode') === 'SERVER'
})

const noRemoveAll = computed(() => {
  return compact.value || isServerMode.value
})

const noSignOut = computed(() => {
  return !isServerMode.value
})

const noAnalysis = computed(() => {
  return isServerMode.value
})
</script>

<template>
  <div class="app-sidebar d-flex flex-column" :class="classList">
    <div class="flex-grow-1 px-3 py-4">
      <div class="d-flex justify-content-between">
        <app-sidebar-toggler v-model.active="compact" />
        <app-sidebar-close v-if="!compact" v-model.active="closed" />
      </div>
      <div class="py-4 d-flex flex-column gap-3">
        <app-sidebar-section :title="t('appSidebar.projects')" icon="circles-three-plus" :compact="compact">
          <app-sidebar-section-entry
            icon="dots-nine"
            exact-match
            :to="{ name: 'project.list' }"
            :action-to="{ name: 'project.new' }"
            action-title="Add project"
          >
            {{ t('appSidebar.allProjects') }}
          </app-sidebar-section-entry>
          <app-sidebar-section-entry
            v-for="project in projects"
            :key="project.name"
            icon="push-pin"
            :to="{ name: 'project.view', params: { name: project.name } }"
          >
            <project-label :project="project" hide-thumbnail />
          </app-sidebar-section-entry>
        </app-sidebar-section>
        <app-sidebar-section title="Explore" icon="magnifying-glass" :to="{ name: 'search' }" :compact="compact">
          <app-sidebar-section-entry icon="magnifying-glass" :to="{ name: 'search' }" exact-match>
            {{ t('appSidebar.search') }}
          </app-sidebar-section-entry>
          <app-sidebar-section-entry icon="clock-counter-clockwise" :to="{ name: 'user-history.document.list' }">
            {{ t('appSidebar.visitedDocuments') }}
          </app-sidebar-section-entry>
          <app-sidebar-section-entry icon="list-checks" :to="{ name: 'user-history.saved-search.list' }">
            {{ t('appSidebar.savedSearches') }}
          </app-sidebar-section-entry>
        </app-sidebar-section>
        <app-sidebar-section :title="t('appSidebar.tasks')" icon="rocket-launch" :to="{ name: 'search' }" :compact="compact">
          <app-sidebar-section-entry
            icon="list-magnifying-glass"
            :to="{ name: 'task.batch-search.list' }"
            :action-to="{ name: 'task.batch-search.new' }"
            :action-title="t('appSidebar.batchSearchesAction')"
          >
            {{ t('appSidebar.batchSearches') }}
          </app-sidebar-section-entry>
          <app-sidebar-section-entry icon="download-simple" :to="{ name: 'task.batch-download.list' }">
            {{ t('appSidebar.batchDownloads') }}
          </app-sidebar-section-entry>
          <app-sidebar-section-entry v-if="!noAnalysis" icon="files" :to="{ name: 'task.analysis.list' }">
            {{ t('appSidebar.documents') }}
          </app-sidebar-section-entry>
        </app-sidebar-section>
      </div>
    </div>
    <app-sidebar-footer
      :compact="compact"
      :no-help="compact"
      :no-remove-all="noRemoveAll"
      :no-sign-out="noSignOut"
      :sign-out-link="signOutLink"
      :help-link="helpLink"
    >
      <version-number />
    </app-sidebar-footer>
  </div>
</template>

<style lang="scss" scoped>
.app-sidebar {
  color: var(--bs-tertiary-color-subtle);
  background: var(--bs-tertiary-bg-subtle);
  flex: 1;
  width: 100%;
  max-width: 310px;
  min-height: 100%;
  max-height: 100vh;
  overflow: auto;
  position: sticky;
  top: 0;
  left: 0;

  &--compact {
    max-width: 85px;
  }
}
</style>
