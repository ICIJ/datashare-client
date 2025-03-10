<script setup>
import { useI18n } from 'vue-i18n'

import { useCore } from '@/composables/core'
import BatchSearchActionEdit from '@/components/BatchSearch/BatchSearchAction/BatchSearchActionEdit'
import BatchSearchActionRelaunch from '@/components/BatchSearch/BatchSearchAction/BatchSearchActionRelaunch'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete'
import ButtonRowActionStop from '@/components/Button/ButtonRowAction/ButtonRowActionStop'
import { useTaskStore } from '@/store/modules'

defineOptions({ name: 'BatchSearchActions' })

const props = defineProps({
  uuid: {
    type: String,
    required: true
  },
  showLabels: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()

const successMessage = t('batchSearchActions.remove.success')
const errorMessage = t('batchSearchActions.remove.error')
const { toastedPromise } = useCore()
const taskStore = useTaskStore()

function deleteBatchSearch() {
  return toastedPromise(taskStore.deleteBatchSearch(props.uuid), { successMessage, errorMessage })
}

function copyBatchSearch({ title, description }) {
  return toastedPromise(taskStore.copyBatchSearch(props.uuid, title, description), { successMessage, errorMessage })
}

function editBatchSearch({ title, description }) {
  console.info('Not implemented: editBatchSearch with ', title, ' ', description)
}
</script>

<template>
  <div class="batch-search-actions flex-wrap d-flex gap-2">
    <batch-search-action-edit :uuid="uuid" @edit="editBatchSearch" />
    <batch-search-action-relaunch :disabled="!taskStore.isOver(uuid)" @relaunch="copyBatchSearch" />
    <button-row-action-stop :disabled="!taskStore.isRunning(uuid)" @stop="taskStore.stopTask(uuid)" />
    <button-row-action-delete @delete="deleteBatchSearch" />
  </div>
</template>
