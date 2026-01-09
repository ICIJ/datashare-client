<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'
import IPhArrowCounterClockwise from '~icons/ph/arrow-counter-clockwise'

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
  submitIcon: {
    type: [String, Object, Array]
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
  <b-form
    class="form-creation"
    novalidate
    @reset.stop.prevent="reset"
    @submit.stop.prevent="submit"
  >
    <div
      aria-description="form-content"
      :class="contentClassList"
    >
      <slot />
    </div>
    <div
      class="d-flex justify-content-end mb-4"
      aria-description="form-footer"
    >
      <span class="d-flex gap-4">
        <button-icon
          type="reset"
          variant="outline-light"
          :icon-left="IPhArrowCounterClockwise"
          class="btn btn-outline-action"
          :label="resetLabel ?? t('global.reset')"
        >
          <slot name="reset-text" />
        </button-icon>
        <button-icon
          type="submit"
          variant="action"
          :disabled="!valid"
          :icon-right="submitIcon"
        >
          <slot name="submit-text">{{ submitLabel ?? t('global.submit') }}</slot>
        </button-icon>
      </span>
    </div>
  </b-form>
</template>
