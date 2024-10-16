<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'
const { t } = useI18n()
const props = defineProps({
  valid: {
    type: Boolean,
    default: true
  },
  showDeleteButton: {
    type: Boolean,
    default: false
  },
  submitLabel: {
    type: String
  },
  resetLabel: {
    type: String
  },
  deleteLabel: {
    type: String
  },
  deleteConfirmation: {
    type: String
  }
})
const emit = defineEmits(['submit', 'reset', 'delete'])

function emitDelete() {
  emit('delete')
}
function emitReset() {
  emit('reset')
}
function submit() {
  if (props.valid) {
    emit('submit')
  }
}
</script>

<template>
  <b-form class="form-creation" novalidate @submit.stop.prevent="submit">
    <div aria-description="form-content">
      <slot></slot>
    </div>
    <div
      class="d-flex"
      :class="{ 'justify-content-between': showDeleteButton, 'justify-content-end': !showDeleteButton }"
      aria-description="form-footer"
    >
      <confirm-button
        v-if="showDeleteButton"
        type="button"
        class="form-creation__action--delete btn btn-danger"
        :confirmed="emitDelete"
        :label="deleteConfirmation ?? t('global.confirmLabel')"
      >
        <phosphor-icon name="trash-can" class="me-1" />
        <slot name="delete-text">{{ deleteLabel ?? t('global.delete') }}</slot>
      </confirm-button>
      <span class="d-flex gap-2">
        <button-icon
          type="button"
          variant="outline-light"
          icon-left="arrow-counter-clockwise"
          class="form-creation__action--reset btn btn-outline-action"
          :label="resetLabel ?? t('global.reset')"
          @click="emitReset"
        >
          <slot name="reset-text" />
        </button-icon>
        <b-button type="submit" variant="action" class="ms-2" :disabled="!valid">
          <slot name="submit-text">{{ submitLabel ?? t('global.submit') }}</slot>
        </b-button>
      </span>
    </div>
  </b-form>
</template>

<style scoped lang="scss"></style>
