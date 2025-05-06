<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

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
    <button-icon
      v-if="!hideStopPending"
      icon-left="hand"
      class="task-actions__stop-pending-tasks"
      variant="outline-primary"
      :disabled="!hasPendingTasks"
      @click="stopPendingTasks"
    >
      {{ t('taskActions.stopPendingTasks') }}
    </button-icon>
    <button-icon
      v-if="!hideClearDone"
      icon-left="trash"
      class="task-actions__delete-done-tasks"
      variant="outline-primary"
      :disabled="!hasDoneTasks"
      @click="removeDoneTasks"
    >
      {{ t('taskActions.removeDoneTasks') }}
    </button-icon>
  </div>
</template>
