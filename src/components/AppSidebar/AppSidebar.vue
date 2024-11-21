<script setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AppSidebarFooter from './AppSidebarFooter'
import AppSidebarSection from './AppSidebarSection'
import AppSidebarSectionEntry from './AppSidebarSectionEntry'
import AppSidebarToggler from './AppSidebarToggler'
import AppSidebarClose from './AppSidebarClose'

import { Api } from '@/api'
import { useBreakpoints } from '@/composables/breakpoints'
import { useCore } from '@/composables/core'
import { useUtils } from '@/composables/utils'
import ProjectLabel from '@/components/Project/ProjectLabel'
import VersionNumber from '@/components/VersionNumber'
import { SIZE } from '@/enums/sizes'
import settings from '@/utils/settings'

const { core } = useCore()
const { isServer } = useUtils()
const { breakpointDown } = useBreakpoints()
const { t } = useI18n()

const projects = computed(() => {
  return core.projects
})

const pinnedProjects = computed(() => {
  return projects.value.filter((project) => core.store.getters['app/isProjectPinned'](project.name))
})

const compact = computed({
  // Compact mode is always disabled on screen smaller than MD
  get: () => !breakpointDown.value[SIZE.MD] && core.store.state.app.sidebar.compact,
  set: (value) => core.store.dispatch('app/toggleSidebarCompact', value)
})

const closed = computed({
  get: () => core.store.state.app.sidebar.closed,
  set: (value) => core.store.dispatch('app/toggleSidebarClosed', value)
})

// Watch the current breadpoint state to
// automaticaly close the sidebar if it's
// not closed already on screens smaller than MD
watch(
  () => breakpointDown.value[SIZE.MD],
  (downMd) => {
    closed.value = !closed.value && downMd
  },
  // Eager watcher to trigger the callback immediately
  // when the component is mounted.
  { immediate: true }
)

const classList = computed(() => {
  return {
    'app-sidebar--compact': compact.value,
    'app-sidebar--closed': closed.value,
    'app-sidebar--full-width': breakpointDown.value[SIZE.MD]
  }
})

const toAddProject = computed(() => {
  return isServer.value ? null : { name: 'project.new' }
})

const signOutLink = computed(() => {
  return Api.getFullUrl(import.meta.env.VITE_DS_AUTH_SIGNOUT)
})

const helpLink = computed(() => {
  return core.config.get('helpLink', settings.helpLink)
})

const noRemoveAll = computed(() => {
  return compact.value || isServer.value
})

const noSignOut = computed(() => {
  return !isServer.value
})

const noAnalysis = computed(() => {
  return isServer.value
})
</script>

<template>
  <div class="app-sidebar" :class="classList">
    <div class="flex-grow-1 p-3">
      <div class="d-flex justify-content-between">
        <app-sidebar-toggler v-model:active="compact" class="d-none d-md-block" />
        <app-sidebar-close v-if="!compact" v-model:active="closed" />
      </div>
      <div class="py-4 d-flex flex-column gap-3">
        <app-sidebar-section :title="t('appSidebar.projects')" icon="circles-three-plus" :compact="compact">
          <app-sidebar-section-entry
            :icon="PhDotsNine"
            exact-match
            :to="{ name: 'project.list' }"
            :action-to="toAddProject"
            action-title="Add project"
          >
            {{ t('appSidebar.allProjects') }}
          </app-sidebar-section-entry>
          <app-sidebar-section-entry
            v-for="project in pinnedProjects"
            :key="project.name"
            :icon="PhPushPin"
            :to="{ name: 'project.view.overview.insights', params: { name: project.name } }"
          >
            <project-label :project="project" hide-thumbnail />
          </app-sidebar-section-entry>
        </app-sidebar-section>
        <app-sidebar-section title="Explore" :icon="PhMagnifyingGlass" :to="{ name: 'search' }" :compact="compact">
          <app-sidebar-section-entry :icon="PhMagnifyingGlass" :to="{ name: 'search' }" exact-match>
            {{ t('appSidebar.search') }}
          </app-sidebar-section-entry>
          <app-sidebar-section-entry :icon="PhClockCounterClockwise" :to="{ name: 'user-history.document.list' }">
            {{ t('appSidebar.visitedDocuments') }}
          </app-sidebar-section-entry>
          <app-sidebar-section-entry :icon="PhListChecks" :to="{ name: 'user-history.saved-search.list' }">
            {{ t('appSidebar.savedSearches') }}
          </app-sidebar-section-entry>
        </app-sidebar-section>
        <app-sidebar-section
          :title="t('appSidebar.tasks')"
          :icon="PhRocketLaunch"
          :to="{ name: 'search' }"
          :compact="compact"
        >
          <app-sidebar-section-entry
            :icon="PhListMagnifyingGlass"
            :to="{ name: 'task.batch-search.list' }"
            :action-to="{ name: 'task.batch-search.new' }"
            :action-title="t('appSidebar.batchSearchesAction')"
          >
            {{ t('appSidebar.batchSearches') }}
          </app-sidebar-section-entry>
          <app-sidebar-section-entry :icon="PhDownloadSimple" :to="{ name: 'task.batch-download.list' }">
            {{ t('appSidebar.batchDownloads') }}
          </app-sidebar-section-entry>
          <app-sidebar-section-entry
            v-if="!noAnalysis"
            :icon="PhFiles"
            :to="{ name: 'task.documents.list' }"
            :action-to="{ name: 'task.documents.new' }"
            :action-title="t('task.documents.new.title')"
          >
            {{ t('appSidebar.documents') }}
          </app-sidebar-section-entry>
          <app-sidebar-section-entry
            v-if="!noAnalysis"
            :icon="PhUsersThree"
            :to="{ name: 'task.entities.list' }"
            :action-to="{ name: 'task.entities.new' }"
            :action-title="t('task.entities.new.title')"
          >
            {{ t('appSidebar.entities') }}
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
  z-index: $zindex-offcanvas + 1;
  color: var(--bs-tertiary-color-subtle);
  background: var(--bs-tertiary-bg-subtle);
  flex: 0 0 $app-sidebar-width;
  width: 100%;
  max-width: $app-sidebar-width;
  min-height: 100%;
  max-height: 100vh;
  overflow: auto;
  position: sticky;
  top: 0;
  left: 0;

  display: flex;
  flex-direction: column;

  &--compact {
    max-width: $app-sidebar-compact-width;
  }

  &--closed {
    display: none;
  }

  &--full-width {
    max-width: 100%;
    width: 100%;
    position: fixed;
    right: 0;
    left: 0;
    bottom: 0;
  }
}
</style>
