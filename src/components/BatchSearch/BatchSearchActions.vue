<script setup>
import { useI18n } from 'vue-i18n'

import ButtonRowAction from '@/components/Button/ButtonRowAction'
import { useConfirmModal } from '@/composables/confirm'
import { useCore } from '@/composables/core'

defineOptions({ name: 'BatchSearchActions' })
const props = defineProps({
  uuid: { type: String, required: true },
  showLabels: { type: Boolean, default: false }
})
const emit = defineEmits(['delete', 'relaunch', 'edit'])
const { t } = useI18n()
const { confirm: showConfirmModal } = useConfirmModal()

const successMessage = t('batchSearchActions.remove.success')
const errorMessage = t('batchSearchActions.remove.error')
const { core, toastedPromise } = useCore()
function deleteBatchSearch() {
  return toastedPromise(core.api.deleteBatchSearch(props.uuid), { successMessage, errorMessage })
}
async function onDelete() {
  if (await showConfirmModal()) {
    await deleteBatchSearch()
    emit(deleteAction.event, props.uuid)
  }
}

const relaunchAction = {
  event: 'relaunch',
  label: 'batchSearchCardActions.relaunch',
  icon: 'arrow-clockwise'
}
const editAction = {
  event: 'edit',
  label: 'batchSearchCardActions.edit',
  icon: 'pencil-simple'
}
const deleteAction = {
  event: 'delete',
  label: 'batchSearchCardActions.delete',
  icon: 'trash'
}
</script>

<template>
  <div class="batch-search-actions flex-wrap d-flex gap-2">
    <button-row-action
      :icon="relaunchAction.icon"
      :label="t(relaunchAction.label)"
      @click="$emit(relaunchAction.event, uuid)"
    />
    <button-row-action :icon="editAction.icon" :label="t(editAction.label)" @click="$emit(editAction.event, uuid)" />
    <button-row-action :icon="deleteAction.icon" :label="t(deleteAction.label)" @click="onDelete" />
  </div>
</template>
