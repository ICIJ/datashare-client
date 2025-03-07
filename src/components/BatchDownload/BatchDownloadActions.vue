<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import PageTableToggleDetailsButton from '@/components/PageTable/PageTableToggleDetailsButton'
import { useCore } from '@/composables/core'
import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete'
import { TASK_STATUS } from '@/enums/taskStatus'
const showSearch = defineModel('toggle', { type: Boolean })

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
const { core, toast } = useCore()
const { t } = useI18n()
const emit = defineEmits(['relaunch', 'relaunchFailed', 'delete', 'deleteFailed'])
const isTaskRunning = computed(() => {
  return props.state.toLowerCase() === TASK_STATUS.RUNNING
})

const projects = computed(() => {
  return props.value?.projects?.map((p) => p.name) || []
})
const uri = computed(() => {
  let uri = props.value?.uri
  if (uri && uri.startsWith('/')) {
    uri = uri.startsWith('/') ? uri.substring(1) : uri
  }
  return uri
})

async function deleteTask() {
  try {
    await core.api.deleteTask(props.id)
    notifyDeleteSucceed()
  } catch (error) {
    notifyDeleteFailed(error)
  }
}
const parseQuery = computed(() => {
  return JSON.parse(props.value.query?.query || null) ?? {}
})
async function relaunchTask() {
  try {
    await core.api.runBatchDownload({ projectIds: projects.value, query: parseQuery.value, uri: uri.value })
    notifyRelaunchSucceed()
  } catch (error) {
    notifyRelaunchFailed(error)
  }
}
function notifyRelaunchSucceed() {
  const title = t('batchDownload.relaunch.succeed')
  const body = t('batchDownload.relaunch.succeedBody')
  toast.success(body, { title })
  /**
   * The batch download was relaunched successfully
   *
   * @event relaunched
   */
  emit('relaunch', props.value)
}
function notifyRelaunchFailed(error) {
  const title = t('batchDownload.relaunch.failed')
  const body = t('batchDownload.relaunch.failedBody')
  toast.error(body, { title })
  /**
   * The batch download couldn't be relaunched
   *
   * @event relaunchFailed
   */
  emit('relaunchFailed', error)
}
function notifyDeleteSucceed() {
  /**
   * The batch download was deleted successfully
   *
   * @event delete
   */
  emit('delete', props.value)
}
function notifyDeleteFailed(error) {
  const title = t('batchDownload.delete.failed')
  const body = t('batchDownload.delete.failedBody')
  toast.error(body, { title })
  /**
   * The batch download couldn't be deleted
   *
   * @event deleteFailed
   */
  emit('deleteFailed', error)
}
</script>

<template>
  <div class="batch-download-actions d-flex gap-2">
    <button-row-action icon="arrow-clockwise" :label="t('batchDownloadActions.relaunch')" @click="relaunchTask" />
    <button-row-action
      icon="magnifying-glass"
      tag="router-link"
      :disabled="!uri"
      :to="{ hash: uri, name: 'search' }"
      :label="t('batchDownloadActions.search')"
    />

    <button-row-action-delete :disabled="isTaskRunning" @delete="deleteTask" />
    <page-table-toggle-details-button v-model="showSearch" />
  </div>
</template>
