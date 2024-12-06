<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

const { t } = useI18n()

const props = defineProps({
  valid: {
    type: Boolean,
    default: true
  },
  contentClassList: {
    type: String
  },
  submitLabel: {
    type: String
  },
  resetLabel: {
    type: String
  }
})
const emit = defineEmits(['submit', 'reset'])

function reset() {
  emit('reset')
}

function submit(values) {
  if (props.valid) {
    emit('submit', new FormData(values.target))
  }
}
</script>

<template>
  <b-form class="form-creation" novalidate @reset.stop.prevent="reset" @submit.stop.prevent="submit">
    <div aria-description="form-content" :class="contentClassList">
      <slot></slot>
    </div>
    <div class="d-flex justify-content-end mb-4" aria-description="form-footer">
      <span class="d-flex gap-2">
        <button-icon
          type="reset"
          variant="outline-light"
          icon-left="arrow-counter-clockwise"
          class="form-creation__action--reset btn btn-outline-action"
          :label="resetLabel ?? t('global.reset')"
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
