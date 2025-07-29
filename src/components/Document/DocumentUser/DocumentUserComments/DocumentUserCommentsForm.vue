<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

defineOptions({ name: 'DocumentUserCommentsAction' })

defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})
const { t } = useI18n()

const comment = defineModel({ type: String, default: '' })

const emit = defineEmits({
  submit(value) {
    return !!value
  }
})
</script>

<template>
  <b-form
    class="document-user-comments-form d-flex flex-column gap-2"
    @submit.prevent="emit('submit', comment)"
  >
    <b-form-textarea
      v-model="comment"
      :disabled="disabled"
      :rows="3"
      :max-rows="8"
      :placeholder="t('documentUserCommentsForm.placeholder')"
      @keydown.enter.ctrl="emit('submit', comment)"
    />
    <div class="d-flex justify-content-end gap-2">
      <button-icon
        type="submit"
        variant="action"
        :disabled="disabled"
      >
        {{ t('documentUserCommentsForm.submit') }}
      </button-icon>
    </div>
  </b-form>
</template>
