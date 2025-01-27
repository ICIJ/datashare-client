<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  hasPendingTasks: {
    type: Boolean,
    default: false
  },
  hasDoneTasks: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['stop-pending', 'delete-done'])

async function stopPendingTasks() {
  if (props.hasPendingTasks) {
    emit('stop-pending')
  }
}

async function deleteDoneTasks() {
  if (props.hasDoneTasks) {
    emit('delete-done')
  }
}
</script>

<template>
  <b-button-group class="task-actions me-2">
    <button-icon
      icon-left="hand"
      class="task-actions__stop-pending-tasks"
      variant="outline-primary"
      :disabled="!hasPendingTasks"
      @click="stopPendingTasks"
    >
      {{ $t('indexing.stopPendingTasks') }}
    </button-icon>
    <button-icon
      icon-left="trash"
      class="task-actions__delete-done-tasks"
      variant="outline-primary"
      :disabled="!hasDoneTasks"
      @click="deleteDoneTasks"
    >
      {{ $t('indexing.deleteDoneTasks') }}
    </button-icon>
  </b-button-group>
</template>
