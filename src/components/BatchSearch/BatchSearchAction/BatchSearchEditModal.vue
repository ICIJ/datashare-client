<script setup>
import AppModal from '@/components/AppModal/AppModal'
const show = defineModel({ type: Boolean })
const name = defineModel('name', { type: String })
const description = defineModel('description', { type: String })
defineProps({
  modalTitle: { type: String },
  modalDescription: { type: String }
})
const emit = defineEmits(['ok'])
function onOk() {
  emit('ok', { name, description })
}
</script>

<template>
  <app-modal v-model="show" :title="modalTitle" :description="modalDescription" @ok="onOk">
    <div class="d-flex flex-column gap-3">
      <b-form-group label="Title" label-for="input-name">
        <b-form-input id="input-name" ref="inputModal" v-model="name" type="text" placeholder="Batch search title" />
      </b-form-group>

      <b-form-group label="Description" label-for="input-description">
        <b-form-textarea id="input-description" v-model="description" placeholder="Description" />
      </b-form-group>
    </div>
  </app-modal>
</template>
