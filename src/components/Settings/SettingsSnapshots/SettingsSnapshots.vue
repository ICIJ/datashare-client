<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import SettingsSnapshotsList from '@/components/Settings/SettingsSnapshots/SettingsSnapshotsList'
import SettingsSnapshotsActionsCreate from '@/components/Settings/SettingsSnapshots/SettingsSnapshotsActionsCreate'
import SettingsSnapshotsActionsDeleteRepository from '@/components/Settings/SettingsSnapshots/SettingsSnapshotsActionsDeleteRepository'
import SettingsSnapshotsSetup from '@/components/Settings/SettingsSnapshots/SettingsSnapshotsSetup'
import DisplaySnapshotRepositoryType from '@/components/Display/DisplaySnapshotRepositoryType'
import DisplayPath from '@/components/Display/DisplayPath'

defineOptions({ name: 'SettingsSnapshots' })

const props = defineProps({
  snapshots: {
    type: Array,
    default: () => []
  },
  repositoryConfig: {
    type: Object,
    default: null
  },
  availablePaths: {
    type: Array,
    default: () => []
  },
  pathsLoaded: {
    type: Boolean,
    default: false
  },
  hasRepository: {
    type: Boolean,
    default: false
  },
  hasAvailablePaths: {
    type: Boolean,
    default: false
  },
  hasSinglePath: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['create', 'delete', 'restore', 'createRepository', 'deleteRepository'])

const { t } = useI18n()

const repositoryType = computed(() => props.repositoryConfig?.type ?? 'fs')
const repositoryLocation = computed(() => props.repositoryConfig?.settings?.location ?? '')
const hasSnapshots = computed(() => props.snapshots.length > 0)
</script>

<template>
  <div class="settings-snapshots">
    <template v-if="hasRepository">
      <div class="settings-snapshots__header d-flex justify-content-between align-items-center mb-4">
        <h5 class="settings-snapshots__header__title m-0">
          {{ t('settings.snapshots.title') }}
        </h5>
        <div class="settings-snapshots__header__actions d-flex gap-2">
          <settings-snapshots-actions-create
            :is-loading="isLoading"
            @create="emit('create')"
          />
          <settings-snapshots-actions-delete-repository
            :is-loading="isLoading"
            @delete="emit('deleteRepository')"
          />
        </div>
      </div>
      <settings-snapshots-list
        :snapshots="snapshots"
        :is-loading="isLoading"
        @delete="emit('delete', $event)"
        @restore="emit('restore', $event)"
      />
      <p
        v-if="hasSnapshots"
        class="settings-snapshots__repository text-secondary text-center mt-3 mb-0"
      >
        <i18n-t
          keypath="settings.snapshots.repository.description"
          tag="span"
        >
          <template #type>
            <display-snapshot-repository-type
              :value="repositoryType"
              class="settings-snapshots__repository__type"
            />
          </template>
          <template #location>
            <display-path
              :value="repositoryLocation"
              class="settings-snapshots__repository__location bg-info-subtle font-monospace"
            />
          </template>
        </i18n-t>
      </p>
    </template>
    <settings-snapshots-setup
      v-else
      :available-paths="availablePaths"
      :paths-loaded="pathsLoaded"
      :has-available-paths="hasAvailablePaths"
      :has-single-path="hasSinglePath"
      :is-loading="isLoading"
      @submit="emit('createRepository', $event)"
    />
  </div>
</template>
