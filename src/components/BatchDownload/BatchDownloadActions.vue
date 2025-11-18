<script setup>
import { property } from 'lodash'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete'
import PageTableToggleDetailsButton from '@/components/PageTable/PageTableToggleDetailsButton'
import { useCore } from '@/composables/useCore'
import { useToast } from '@/composables/useToast'
import { useConfirmModal } from '@/composables/useConfirmModal'
import { TASK_STATUS } from '@/enums/taskStatus'

const toggleDetails = defineModel('toggleDetails', { type: Boolean })

const props = defineProps({
  /**
   * id of the batch download's task
   */
  id: {
    type: String,
    required: true
  },
  /**
   * Name of the batch download's task
   */
  name: {
    type: String
  },
  /**
   * State of the batch download's task
   */
  state: {
    type: String,
    default: ''
  },
  /**
   * Attributes of the batch download
   */
  value: {
    type: Object,
    default: () => ({})
  }
})

const core = useCore()
const { toastedPromise } = useToast()
const { afterConfirmation } = useConfirmModal()
const { t } = useI18n()
const emit = defineEmits(['refresh', 'relaunch', 'relaunchFailed', 'delete', 'deleteFailed'])

const isTaskRunning = computed(() => props.state.toLowerCase() === TASK_STATUS.RUNNING)
const projectIds = computed(() => props.value?.projects?.map(property('name')) || [])
const query = computed(() => JSON.parse(props.value?.query?.query || null) ?? {})
const uri = computed(() => {
  if (props.value?.uri?.startsWith('/')) {
    return props.value.uri.substring(1)
  }

  return props.value.uri
})

async function remove() {
  const successMessage = t('batchDownloadActions.remove.success')
  const errorMessage = t('batchDownloadActions.remove.error')
  await toastedPromise(core.api.removeTask(props.id), { successMessage, errorMessage })
  emit('refresh')
}

async function relaunch() {
  const successMessage = t('batchDownloadActions.relaunch.success')
  const errorMessage = t('batchDownloadActions.relaunch.error')
  const promise = core.api.runBatchDownload({ projectIds: projectIds.value, query: query.value, uri: uri.value })
  await toastedPromise(promise, { successMessage, errorMessage })
  emit('refresh')
}
</script>

<template>
  <div class="batch-download-actions d-flex gap-2">
    <button-row-action
      icon="arrow-clockwise"
      :label="t('batchDownloadActions.relaunch.label')"
      @click="relaunch"
    />
    <button-row-action
      icon="magnifying-glass"
      tag="router-link"
      :disabled="!uri"
      :to="{ hash: uri, name: 'search' }"
      :label="t('batchDownloadActions.search.label')"
    />
    <button-row-action-delete
      :disabled="isTaskRunning"
      :label="t('batchDownloadActions.remove.label')"
      @click="afterConfirmation(remove)"
    />
    <page-table-toggle-details-button v-model="toggleDetails" />
  </div>
</template>
