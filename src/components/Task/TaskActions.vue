<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  hasPendingTasks: {
    type: Boolean
  },
  hasDoneTasks: {
    type: Boolean
  }
})
const emit = defineEmits(['stop-pending', 'delete-done'])

async function stopPendingTasks() {
  emit('stop-pending')
}

async function deleteDoneTasks() {
  emit('delete-done')
}
</script>

<template>
  <b-button-group class="task-analysis-list__actions me-2">
    <button-icon
      icon-left="hand"
      class="task-analysis-list__actions__stop-pending-tasks"
      variant="outline-primary"
      :disabled="!hasPendingTasks"
      @click="stopPendingTasks"
    >
      {{ $t('indexing.stopPendingTasks') }}
    </button-icon>
    <button-icon
      icon-left="trash"
      class="task-analysis-list__actions__delete-done-tasks"
      variant="outline-primary"
      :disabled="!hasDoneTasks"
      @click="deleteDoneTasks"
    >
      {{ $t('indexing.deleteDoneTasks') }}
    </button-icon>
  </b-button-group>
</template>

<style scoped lang="scss"></style>
