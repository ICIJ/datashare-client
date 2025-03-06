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
const { t } = useI18n()
const { confirm: showConfirmModal } = useConfirmModal()
const { core, toastedPromise } = useCore()

async function showRemoveModal() {
  if (await showConfirmModal()) {
    await deleteBatchSearch()
  }
}
function deleteBatchSearch() {
  return toastedPromise(core.api.deleteBatchSearch(props.uuid), { successMessage: 'ouais!', errorMessage: 'boouh' })
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
    <button-row-action
      :icon="deleteAction.icon"
      :label="t(deleteAction.label)"
      @click="$emit(deleteAction.event, uuid)"
    />
  </div>
</template>
<style lang="scss">
.batch-search-card-actions {
  &__see-all {
    justify-content: space-between;
  }
  &__download {
    justify-content: center;
  }
}
</style>
