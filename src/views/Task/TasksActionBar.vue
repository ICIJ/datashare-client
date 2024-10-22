<script setup>
import { computed, ref } from 'vue'
import { filter, random, uniqueId } from 'lodash'

import { useCore } from '@/composables/core'
const { core } = useCore()
const emit = defineEmits(['start-polling'])

const extractingFormId = uniqueId('extracting-form-')
const showExtractingForm = ref(false)

function closeExtractingForm() {
  showExtractingForm.value = false
  emit('start-polling')
}
function closeFindNamedEntitiesForm() {
  showFindNamedEntitiesForm.value = false
  emit('start-polling')
}

const showFindNamedEntitiesForm = ref(false)
const findNamedEntitiesFormId = uniqueId('find-named-entities-form-')

const hasPendingTasks = computed(() => {
  return core.store.getters['indexing/hasPendingTasks']
})
const hasDoneTasks = computed(() => {
  return core.store.getters['indexing/hasDoneTasks']
})
async function stopPendingTasks() {
  await core.store.dispatch('indexing/stopPendingTasks')
  await core.store.dispatch('indexing/getTasks')
}

async function deleteDoneTasks() {
  await core.store.dispatch('indexing/deleteDoneTasks')
  await core.store.dispatch('indexing/getTasks')
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
