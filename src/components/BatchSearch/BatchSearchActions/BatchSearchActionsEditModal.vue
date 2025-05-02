<script setup>
import { useI18n } from 'vue-i18n'

import AppModalPrompt from '@/components/AppModal/AppModalPrompt'

const name = defineModel('name', { type: String, default: '' })
const description = defineModel('description', { type: String, default: '' })

const emit = defineEmits(['submit'])

const submit = () => {
  emit('submit', {
    trigger: 'submit',
    name: name.value,
    description: description.value
  })
}
const { t } = useI18n()
</script>

<template>
  <app-modal-prompt :title="t('batchSearchActionsEditModal.title')" @submit="submit">
    <div class="d-flex flex-column gap-3">
      <b-form-group :label="t('batchSearchActionsEditModal.name')" label-for="input-name">
        <b-form-input id="input-name" ref="inputModal" v-model="name" type="text" />
      </b-form-group>
      <b-form-group :label="t('batchSearchActionsEditModal.description')" label-for="input-description">
        <b-form-textarea id="input-description" v-model="description" />
      </b-form-group>
    </div>
  </app-modal-prompt>
</template>
