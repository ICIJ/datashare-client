<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useToast } from '@/composables/useToast'
import BatchSearchActionsDelete from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsDelete'
import BatchSearchActionsEdit from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsEdit'
import BatchSearchActionsStop from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsStop'
import BatchSearchActionsRelaunch from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsRelaunch'
import BatchSearchActionsRelaunchModal from '@/components/BatchSearch/BatchSearchActions/BatchSearchActionsRelaunchModal'
import { useConfirmModal } from '@/composables/useConfirmModal'
import { usePromptModal } from '@/composables/usePromptModal'
import { useTaskStore } from '@/store/modules'

defineOptions({ name: 'BatchSearchActions' })

const { batchSearch } = defineProps({
  batchSearch: {
    type: Object,
    required: true
  },
  hideLabels: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])

const { t } = useI18n()
const router = useRouter()
const { afterConfirmation } = useConfirmModal()
const { prompt: showRelaunchModal } = usePromptModal(BatchSearchActionsRelaunchModal)

const { toastedPromise } = useToast()
const taskStore = useTaskStore()
const isOver = computed(() => taskStore.isOver(batchSearch.uuid))
const isRunning = computed(() => taskStore.isRunning(batchSearch.uuid))

async function remove() {
  const successMessage = t('batchSearchActions.remove.success')
  const errorMessage = t('batchSearchActions.remove.error')
  await toastedPromise(taskStore.removeBatchSearch(batchSearch.uuid), { successMessage, errorMessage })
  emit('refresh')
}

async function stop() {
  const successMessage = t('batchSearchActions.stop.success')
  const errorMessage = t('batchSearchActions.stop.error')
  const { uuid } = batchSearch
  await toastedPromise(taskStore.stopTask(uuid), { successMessage, errorMessage })
  emit('refresh')
}

async function relaunch({ name, description, deleteAfterRelaunch }) {
  const successMessage = t('batchSearchActions.relaunch.success')
  const errorMessage = t('batchSearchActions.relaunch.error')
  const { uuid } = batchSearch
  await toastedPromise(taskStore.relaunchBatchSearch(uuid, name, description), { successMessage, errorMessage })
  // Remove the current batch search if the user has selected the option.
  if (deleteAfterRelaunch) {
    await taskStore.removeBatchSearch(uuid)
  }
  emit('refresh')
}

function goToEdit() {
  const indices = (batchSearch.projects ?? []).join(',')
  router.push({ name: 'task.batch-search.edit', params: { indices, uuid: batchSearch.uuid } })
}

async function relaunchPromptModal() {
  const { name, description } = batchSearch
  const values = await showRelaunchModal({ name, description })
  // Only a valid submit returns value. Cancel or modal hide returns null.
  if (values) {
    await relaunch(values)
  }
}

</script>

<template>
  <div class="batch-search-actions">
    <batch-search-actions-edit
      :hide-label="hideLabels"
      :square="hideLabels"
      @click="goToEdit()"
    />
    <batch-search-actions-relaunch
      :disabled="!isOver"
      :hide-label="hideLabels"
      :square="hideLabels"
      @click="relaunchPromptModal()"
    />
    <batch-search-actions-stop
      v-if="isRunning"
      :hide-label="hideLabels"
      :square="hideLabels"
      @click="stop()"
    />
    <batch-search-actions-delete
      :hide-label="hideLabels"
      :square="hideLabels"
      @click="afterConfirmation(remove)"
    />
  </div>
</template>

<style scoped lang="scss">
.batch-search-actions {
  display: flex;
  flex-wrap: wrap;
  gap: $spacer-sm;
}
</style>