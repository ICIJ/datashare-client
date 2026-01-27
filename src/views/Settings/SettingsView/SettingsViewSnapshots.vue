<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

import SettingsViewLayout from '@/views/Settings/SettingsView/SettingsViewLayout'
import SettingsSnapshots from '@/components/Settings/SettingsSnapshots/SettingsSnapshots'
import { useSnapshots } from '@/composables/useSnapshots'

defineOptions({ name: 'SettingsViewSnapshots' })

const { t } = useI18n()
const {
  sortedSnapshots,
  repositoryConfig,
  availablePaths,
  pathsLoaded,
  hasRepository,
  hasAvailablePaths,
  isLoading,
  fetchAvailablePaths,
  fetchRepository,
  createRepository,
  deleteRepository,
  createSnapshot,
  deleteSnapshot,
  restoreSnapshot,
  startPolling,
  stopPolling
} = useSnapshots()

async function initialize() {
  await fetchRepository()
  await fetchAvailablePaths()
  if (hasRepository.value) {
    await startPolling()
  }
}

async function handleCreateRepository(path) {
  await createRepository(path)
  if (hasRepository.value) {
    await startPolling()
  }
}

async function handleDeleteRepository() {
  stopPolling()
  await deleteRepository()
}

onMounted(initialize)
onBeforeUnmount(stopPolling)
</script>

<template>
  <settings-view-layout
    class="settings-view-snapshots"
    :info-label="t('settings.snapshots.info')"
    info-name="settings.snapshots.info"
  >
    <settings-snapshots
      :snapshots="sortedSnapshots"
      :repository-config="repositoryConfig"
      :available-paths="availablePaths"
      :paths-loaded="pathsLoaded"
      :has-repository="hasRepository"
      :has-available-paths="hasAvailablePaths"
      :is-loading="isLoading"
      @create="createSnapshot"
      @delete="deleteSnapshot"
      @restore="restoreSnapshot"
      @create-repository="handleCreateRepository"
      @delete-repository="handleDeleteRepository"
    />
  </settings-view-layout>
</template>
