<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import { useCore } from '@/composables/core'
import BatchSearchActionsDelete from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsDelete'
import BatchSearchActionsEdit from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsEdit'
import BatchSearchActionsEditModal from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsEditModal'
import BatchSearchActionsStop from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsStop'
import BatchSearchActionsRelaunch from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsRelaunch'
import BatchSearchActionsRelaunchModal from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsRelaunchModal'

import { useConfirmModal } from '@/composables/confirm'
import { usePromptModal } from '@/composables/prompt'
import { useTaskStore } from '@/store/modules'

defineOptions({ name: 'BatchSearchActions' })

const { uuid } = defineProps({
  uuid: {
    type: String,
    required: true
  }
})

const { t } = useI18n()
const { confirm: showConfirmModal } = useConfirmModal()
const { prompt: showEditModal } = usePromptModal(BatchSearchActionsEditModal)
const { prompt: showRelaunchModal } = usePromptModal(BatchSearchActionsRelaunchModal)

const { toastedPromise } = useCore()
const taskStore = useTaskStore()
const batchSearch = computed(() => taskStore.getBatchSearchRecord(uuid))
const isOver = computed(() => taskStore.isOver(uuid))
const isRunning = computed(() => taskStore.isRunning(uuid))

function remove() {
  const successMessage = t('batchSearchActions.remove.success')
  const errorMessage = t('batchSearchActions.remove.error')
  return toastedPromise(taskStore.deleteBatchSearch(uuid), { successMessage, errorMessage })
}

async function stop() {
  const successMessage = t('batchSearchActions.stop.success')
  const errorMessage = t('batchSearchActions.stop.error')
  await toastedPromise(taskStore.stopTask(uuid), { successMessage, errorMessage })
}

async function relaunch({ title, description, deleteAfterRelaunch }) {
  const successMessage = t('batchSearchActions.relaunch.success')
  const errorMessage = t('batchSearchActions.relaunch.error')
  await toastedPromise(taskStore.relaunchBatchSearch(uuid, title, description), { successMessage, errorMessage })
  // Remove the current batch search if the user has selected the option.
  if (deleteAfterRelaunch) {
    await taskStore.deleteBatchSearch(uuid)
  } 
}

async function edit() {
  console.log('Not implemented yet')
}


async function removeConfirmModal() {
  if (await showConfirmModal()) {
    return remove()
  }
}

async function relaunchPromptModal() {
  const { name, description } = batchSearch.value
  const values = await showRelaunchModal({ name, description })
  // Only a valid submit returns value. Cancel or modal hide returns null.
  if (values) {
    return relaunch(values)
  }
}

async function editPromptModal() {
  const { name, description } = batchSearch.value
  const values = await showEditModal({ name, description })
  // Only a valid submit returns value. Cancel or modal hide returns null.
  if (values) {
    await edit(values)
  }
}
</script>

<template>
  <div class="batch-search-actions flex-wrap d-flex gap-2">
    <batch-search-actions-edit @click="editPromptModal()" v-show="false" />
    <batch-search-actions-relaunch :disabled="!isOver" @click="relaunchPromptModal()" />
    <batch-search-actions-stop :disabled="!isRunning" @click="stop()" />
    <batch-search-actions-delete @click="removeConfirmModal()" />
  </div>
</template>
