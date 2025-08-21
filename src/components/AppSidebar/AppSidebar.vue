<script setup>
import { computed, onBeforeMount, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppSidebarFooter from './AppSidebarFooter'
import AppSidebarSection from './AppSidebarSection'
import AppSidebarSectionEntry from './AppSidebarSectionEntry'
import AppSidebarToggler from './AppSidebarToggler'
import AppSidebarClose from './AppSidebarClose'

import { Api } from '@/api'
import Hook from '@/components/Hook/Hook'
import PageOffcanvasReplacement from '@/components/PageOffcanvas/PageOffcanvasReplacement'
import ProjectLabel from '@/components/Project/ProjectLabel'
import VersionNumber from '@/components/VersionNumber'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { useCore } from '@/composables/useCore'
import { useMode } from '@/composables/useMode'
import { useSearchNav } from '@/composables/useSearchNav'
import { SIZE } from '@/enums/sizes'
import { useAppStore } from '@/store/modules'
import settings from '@/utils/settings'

const appStore = useAppStore()
const { core } = useCore()
const { searchRoute, isSearchChildRoute } = useSearchNav()
const { isServer } = useMode()
const { breakpointDown } = useBreakpoints()
const { t } = useI18n()

const projects = computed(() => {
  return core.projects
})

const pinnedProjects = computed(() => {
  return projects.value.filter(project => appStore.isProjectPinned(project.name))
})

const compact = computed({
  // Compact mode is always disabled on screen smaller than MD
  get: () => !breakpointDown.value[SIZE.MD] && appStore.sidebar.compact,
  set: value => (appStore.sidebar.compact = value)
})

const show = computed({
  get: () => !closed.value,
  set: value => (closed.value = !value)
})

const closed = computed({
  get: () => appStore.sidebar.closed,
  set: value => (appStore.sidebar.closed = value)
})

const isOffCanvas = computed(() => breakpointDown.value[SIZE.MD])

// Watch the current breakpoint state to
// automatically close the sidebar if it's
// not closed already on screens smaller than MD
watch(
  () => breakpointDown.value[SIZE.MD],
  (downMd) => {
    closed.value = closed.value || downMd
  },
  // Eager watcher to trigger the callback immediately
  // when the component is mounted.
  { immediate: true }
)

const classList = computed(() => {
  return {
    'app-sidebar--compact': compact.value,
    'app-sidebar--closed': closed.value,
    'app-sidebar--off-canvas': isOffCanvas.value
  }
})

const addToProject = computed(() => {
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

function autoClose() {
  if (isOffCanvas.value && !closed.value) {
    closed.value = true
  }
}

// Ensure the sidebar is closed on route change
onBeforeRouteUpdate(autoClose)
onBeforeRouteLeave(autoClose)
// Ensure the sidebar is closed by default on mobile devices
onBeforeMount(() => (appStore.sidebar.closed = appStore.sidebar.closed || isOffCanvas.value))
</script>

<template>
  <page-offcanvas-replacement
    v-model="show"
    :active="isOffCanvas"
  >
    <div
      class="app-sidebar"
      :class="classList"
    >
      <hook
        name="app-sidebar:before"
        :bind="{ compact, closed }"
      />
      <div class="flex-grow-1 p-3">
        <div class="d-flex justify-content-between">
          <app-sidebar-toggler
            v-model:active="compact"
            class="d-none d-md-inline-flex"
          />
          <app-sidebar-close
            v-if="!compact"
            v-model:active="closed"
          />
        </div>
        <div class="py-4 d-flex flex-column gap-3">
          <hook
            name="app-sidebar-sections:before"
            :bind="{ compact, closed }"
          />
          <app-sidebar-section
            class="app-sidebar__section app-sidebar__section--projects"
            :title="t('appSidebar.projects')"
            :icon="PhCirclesThreePlus"
            :to="{ name: 'project.list' }"
            :compact="compact"
          >
            <app-sidebar-section-entry
              :icon="PhDotsNine"
              exact-match
              :to="{ name: 'project.list' }"
              :action-to="addToProject"
              :action-title="t('projectNew.title')"
            >
              {{ t('appSidebar.allProjects') }}
            </app-sidebar-section-entry>
            <app-sidebar-section-entry
              v-for="project in pinnedProjects"
              :key="project.name"
              :icon="PhPushPin"
              :to="{ name: 'project.view.overview.insights', params: { name: project.name } }"
            >
              <project-label
                :project="project"
                hide-thumbnail
              />
            </app-sidebar-section-entry>
          </app-sidebar-section>
          <app-sidebar-section
            class="app-sidebar__section app-sidebar__section--search"
            :title="t('appSidebar.search')"
            :icon="PhMagnifyingGlass"
            :to="searchRoute"
            :compact="compact"
          >
            <app-sidebar-section-entry
              :icon="PhFileMagnifyingGlass"
              :to="searchRoute"
              :exact-match="!isSearchChildRoute"
            >
              {{ t('appSidebar.searchDocuments') }}
            </app-sidebar-section-entry>
            <app-sidebar-section-entry
              :icon="PhClockCounterClockwise"
              :to="{ name: 'search.history.list' }"
            >
              {{ t('appSidebar.history') }}
            </app-sidebar-section-entry>
            <app-sidebar-section-entry
              :icon="PhListChecks"
              :to="{ name: 'search.saved.list' }"
            >
              {{ t('appSidebar.savedSearches') }}
            </app-sidebar-section-entry>
          </app-sidebar-section>
          <app-sidebar-section
            class="app-sidebar__section app-sidebar__section--task"
            :title="t('task.title')"
            :icon="PhRocketLaunch"
            :to="{ name: 'task.task-board' }"
            :compact="compact"
          >
            <app-sidebar-section-entry
              :icon="PhDotsNine"
              :to="{ name: 'task.task-board' }"
            >
              {{ t('task.task-board.title') }}
            </app-sidebar-section-entry>
            <app-sidebar-section-entry
              :icon="PhListMagnifyingGlass"
              :to="{ name: 'task.batch-search.list' }"
              :action-to="{ name: 'task.batch-search.new' }"
              :action-title="t('task.batch-search.new.title')"
            >
              {{ t('task.batch-search.title') }}
            </app-sidebar-section-entry>
            <app-sidebar-section-entry
              :icon="PhDownloadSimple"
              :to="{ name: 'task.batch-download.list' }"
            >
              {{ t('task.batch-download.title') }}
            </app-sidebar-section-entry>
            <app-sidebar-section-entry
              v-if="!noAnalysis"
              :icon="PhFiles"
              :to="{ name: 'task.documents.list' }"
              :action-to="{ name: 'task.documents.new' }"
              :action-title="t('task.documents.new.title')"
            >
              {{ t('task.documents.title') }}
            </app-sidebar-section-entry>
            <app-sidebar-section-entry
              v-if="!noAnalysis"
              :icon="PhUsersThree"
              :to="{ name: 'task.entities.list' }"
              :action-to="{ name: 'task.entities.new' }"
              :action-title="t('task.entities.new.title')"
            >
              {{ t('task.entities.title') }}
            </app-sidebar-section-entry>
          </app-sidebar-section>
          <hook
            name="app-sidebar-sections:after"
            :bind="{ compact, closed }"
          />
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
        <template #version>
          <version-number />
        </template>
      </app-sidebar-footer>
      <hook name="app-sidebar:after" />
    </div>
  </page-offcanvas-replacement>
</template>

<style lang="scss" scoped>
.app-sidebar {
  z-index: $zindex-fixed;
  color: var(--bs-tertiary-color-subtle);
  background: var(--bs-tertiary-bg-subtle);
  flex: 0 0 $app-sidebar-width;
  width: $app-sidebar-width;
  height: 100vh;
  overflow: auto;
  position: sticky;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;

  &--compact {
    max-width: min($app-sidebar-compact-width, 100vw);
    .app-sidebar__section {
      width: 44px;
    }
  }

  &--closed:not(.app-sidebar--off-canvas) {
    display: none;
  }

  &--off-canvas {
    z-index: none;
    position: relative;
    overflow: visible;
    width: 100%;
  }
}
</style>
