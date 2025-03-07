<script setup>
import { ref } from 'vue'

import BatchSearchEditModal from '@/components/BatchSearch/BatchSearchAction/BatchSearchEditModal'
import { useTaskStore } from '@/store/modules'
import ButtonRowActionEdit from '@/components/Button/ButtonRowAction/ButtonRowActionEdit'
const props = defineProps({
  uuid: { type: String },
  disabled: { type: Boolean }
})

const modalTitle = 'Edit Batch Search'
const modalDescription = 'Edit the batch search'

const show = ref(false)
const taskStore = useTaskStore()
const task = taskStore.getBatchSearchRecord(props.uuid)
const name = ref(task?.name)
const description = ref(task?.description)
// todo CD: see if adding modals for each row won't cause perf issues => reuse modals?
</script>

<template>
  <button-row-action-edit @edit="show = !show" />
  <batch-search-edit-modal
    v-if="task"
    v-model="show"
    v-model:name="name"
    v-model:description="description"
    :modal-title="modalTitle"
    :modal-description="modalDescription"
    @ok="$emit('edit', { name, description })"
  />
</template>
