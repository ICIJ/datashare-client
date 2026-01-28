<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import PageTableGeneric from '@/components/PageTable/PageTableGeneric'
import EmptyState from '@/components/EmptyState/EmptyState'
import DisplayStatus from '@/components/Display/DisplayStatus'
import DisplayDatetimeShort from '@/components/Display/DisplayDatetimeShort'
import DisplayProjectList from '@/components/Display/DisplayProjectList'
import DisplaySnapshotName from '@/components/Display/DisplaySnapshotName'
import DisplaySnapshotVersion from '@/components/Display/DisplaySnapshotVersion'
import DisplaySnapshotDistribution from '@/components/Display/DisplaySnapshotDistribution'
import SettingsSnapshotsActions from '@/components/Settings/SettingsSnapshots/SettingsSnapshotsActions'

defineOptions({ name: 'SettingsSnapshotsList' })

const props = defineProps({
  snapshots: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete', 'restore'])

const { t } = useI18n()

const fields = computed(() => [
  {
    key: 'state',
    text: t('settings.snapshots.list.status')
  },
  {
    key: 'snapshot',
    text: t('settings.snapshots.list.name'),
    emphasis: true
  },
  {
    key: 'start_time',
    text: t('settings.snapshots.list.date')
  },
  {
    key: 'version',
    text: t('settings.snapshots.list.version')
  },
  {
    key: 'distribution',
    text: t('settings.snapshots.list.distribution')
  },
  {
    key: 'indices',
    text: t('settings.snapshots.list.projects')
  }
])

const isEmpty = computed(() => props.snapshots.length === 0)

function statusLabel(state) {
  return t(`settings.snapshots.status.${state}`)
}
</script>

<template>
  <div class="settings-snapshots-list">
    <div
      v-if="isLoading && isEmpty"
      class="settings-snapshots-list__loading text-center py-5"
    >
      <b-spinner />
    </div>
    <empty-state
      v-else-if="isEmpty"
      :label="t('settings.snapshots.noSnapshots')"
      class="settings-snapshots-list__empty"
    />
    <page-table-generic
      v-else
      :items="snapshots"
      :fields="fields"
      :loading="isLoading"
      primary-key="snapshot"
      class="settings-snapshots-list__table"
    >
      <template #cell(state)="{ item }">
        <display-status
          :value="item.state"
          :title="statusLabel(item.state)"
        />
      </template>
      <template #cell(snapshot)="{ item }">
        <display-snapshot-name :value="item.snapshot" />
      </template>
      <template #cell(start_time)="{ item }">
        <display-datetime-short
          v-if="item.start_time"
          :value="item.start_time"
        />
        <span v-else>-</span>
      </template>
      <template #cell(version)="{ item }">
        <display-snapshot-version :value="item.snapshot" />
      </template>
      <template #cell(distribution)="{ item }">
        <display-snapshot-distribution :value="item.snapshot" />
      </template>
      <template #cell(indices)="{ item }">
        <display-project-list
          v-if="item.indices?.length > 0"
          :values="item.indices"
        />
        <span v-else>-</span>
      </template>
      <template #row-actions="{ item }">
        <settings-snapshots-actions
          :name="item.snapshot"
          :state="item.state"
          @delete="emit('delete', $event)"
          @restore="emit('restore', $event)"
        />
      </template>
    </page-table-generic>
  </div>
</template>

<style lang="scss" scoped>
.settings-snapshots-list {
  &__table {
    margin: 0;
  }
}
</style>
