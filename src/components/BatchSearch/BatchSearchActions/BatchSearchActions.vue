<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import { useCore } from '@/composables/useCore'
import BatchSearchActionsDelete from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsDelete'
import BatchSearchActionsEdit from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsEdit'
import BatchSearchActionsEditModal from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsEditModal'
import BatchSearchActionsStop from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsStop'
import BatchSearchActionsRelaunch from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsRelaunch'
import BatchSearchActionsRelaunchModal from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsRelaunchModal'
import { useConfirmModal } from '@/composables/useConfirmModal'
import { usePromptModal } from '@/composables/usePromptModal'
import { useTaskStore } from '@/store/modules'

defineOptions({ name: 'BatchSearchActions' })

const { uuid } = defineProps({
  uuid: {
    type: String,
    required: true
  },
  hideLabels: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])

const { t } = useI18n()
const { afterConfirmation } = useConfirmModal()
const { prompt: showEditModal } = usePromptModal(BatchSearchActionsEditModal)
const { prompt: showRelaunchModal } = usePromptModal(BatchSearchActionsRelaunchModal)

const { toastedPromise } = useCore()
const taskStore = useTaskStore()
const batchSearch = computed(() => taskStore.getBatchSearchRecord(uuid))
const isOver = computed(() => taskStore.isOver(uuid))
const isRunning = computed(() => taskStore.isRunning(uuid))

async function remove() {
  const successMessage = t('batchSearchActions.remove.success')
  const errorMessage = t('batchSearchActions.remove.error')
  await toastedPromise(taskStore.removeBatchSearch(uuid), { successMessage, errorMessage })
  emit('refresh')
}

async function stop() {
  const successMessage = t('batchSearchActions.stop.success')
  const errorMessage = t('batchSearchActions.stop.error')
  await toastedPromise(taskStore.stopTask(uuid), { successMessage, errorMessage })
  emit('refresh')
}

async function relaunch({ name, description, deleteAfterRelaunch }) {
  const successMessage = t('batchSearchActions.relaunch.success')
  const errorMessage = t('batchSearchActions.relaunch.error')
  await toastedPromise(taskStore.relaunchBatchSearch(uuid, name, description), { successMessage, errorMessage })
  // Remove the current batch search if the user has selected the option.
  if (deleteAfterRelaunch) {
    await taskStore.removeBatchSearch(uuid)
  }
  emit('refresh')
}

async function edit() {
  console.log('Not implemented yet')
}

async function relaunchPromptModal() {
  const { name, description } = batchSearch.value
  const values = await showRelaunchModal({ name, description })
  // Only a valid submit returns value. Cancel or modal hide returns null.
  if (values) {
    await relaunch(values)
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
  <div class="batch-search-actions flex-nowrap d-flex gap-2">
    <batch-search-actions-edit v-if="false" :hide-label="hideLabels" :square="hideLabels" @click="editPromptModal()" />
    <batch-search-actions-relaunch
      :disabled="!isOver"
      :hide-label="hideLabels"
      :square="hideLabels"
      @click="relaunchPromptModal()"
    />
    <batch-search-actions-stop v-if="isRunning" :hide-label="hideLabels" :square="hideLabels" @click="stop()" />
    <batch-search-actions-delete :hide-label="hideLabels" :square="hideLabels" @click="afterConfirmation(remove)" />
  </div>
</template>
