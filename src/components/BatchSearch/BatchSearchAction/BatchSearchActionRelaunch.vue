<script setup>
import { ref } from 'vue'

import BatchSearchEditModal from '@/components/BatchSearch/BatchSearchAction/BatchSearchEditModal'
import ButtonRowActionRelaunch from '@/components/Button/ButtonRowAction/ButtonRowActionRelaunch'
import { useTaskStore } from '@/store/modules'
const props = defineProps({
  disabled: { type: Boolean }
})
const modalTitle = 'Relaunch Batch Search'
const modalDescription = 'Relaunch the batch search'

const show = ref(false)
const taskStore = useTaskStore()
const task = taskStore.getBatchSearchRecord(props.uuid)
const name = ref(task?.name)
const description = ref(task?.description)
// todo CD: see if adding modals for each row won't cause perf issues => reuse modals?
</script>

<template>
  <button-row-action-relaunch @relauch="show = !show" />
  <batch-search-edit-modal
    v-if="task"
    v-model="show"
    v-model:name="name"
    v-model:description="description"
    :modal-title="modalTitle"
    :modal-description="modalDescription"
    @ok="$emit('relaunch', { name, description })"
  />
</template>
