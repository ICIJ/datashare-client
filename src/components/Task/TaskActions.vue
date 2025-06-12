<script setup>
import { useI18n } from 'vue-i18n'

import ButtonRowActionDelete from '@/components/Button/ButtonRowAction/ButtonRowActionDelete'
import ButtonRowActionStop from '@/components/Button/ButtonRowAction/ButtonRowActionStop'

const props = defineProps({
  hasPendingTasks: {
    type: Boolean,
    default: false
  },
  hasDoneTasks: {
    type: Boolean,
    default: false
  },
  hideClearDone: {
    type: Boolean,
    default: false
  },
  hideStopPending: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['stop-pending', 'delete-done'])

const { t } = useI18n()

async function stopPendingTasks() {
  if (props.hasPendingTasks) {
    emit('stop-pending')
  }
}

async function removeDoneTasks() {
  if (props.hasDoneTasks) {
    emit('delete-done')
  }
}
</script>

<template>
  <div class="task-actions d-flex gap-3 flex-wrap">
    <button-row-action-stop
      v-if="!hideStopPending"
      class="task-actions__stop-pending-tasks"
      :disabled="!hasPendingTasks"
      :label="t('taskActions.stopPendingTasks')"
      @click="stopPendingTasks"
    />
    <button-row-action-delete
      v-if="!hideClearDone"
      class="task-actions__delete-done-tasks"
      :disabled="!hasDoneTasks"
      :label="t('taskActions.removeDoneTasks')"
      @click="removeDoneTasks"
    />
  </div>
</template>
