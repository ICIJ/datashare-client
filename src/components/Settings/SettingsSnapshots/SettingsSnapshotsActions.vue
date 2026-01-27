<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhArrowCounterClockwise from '~icons/ph/arrow-counter-clockwise'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete'
import { useConfirmModal } from '@/composables/useConfirmModal'
import { SNAPSHOT_STATUS } from '@/composables/useSnapshots'

defineOptions({ name: 'SettingsSnapshotsActions' })

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['delete', 'restore'])

const { t } = useI18n()
const { afterConfirmation } = useConfirmModal()

const isInProgress = computed(() => props.state === SNAPSHOT_STATUS.IN_PROGRESS)

function confirmDelete() {
  const description = t('settings.snapshots.delete.message', { name: props.name })
  afterConfirmation(() => emit('delete', props.name), { description })
}

function confirmRestore() {
  const description = t('settings.snapshots.restore.message', { name: props.name })
  afterConfirmation(() => emit('restore', props.name), { description })
}
</script>

<template>
  <div class="settings-snapshots-actions d-flex gap-2">
    <button-row-action
      :icon="IPhArrowCounterClockwise"
      :label="t('settings.snapshots.restore.confirm')"
      :disabled="isInProgress"
      @click="confirmRestore"
    />
    <button-row-action-delete
      :label="t('settings.snapshots.delete.confirm')"
      :disabled="isInProgress"
      @click="confirmDelete"
    />
  </div>
</template>
