<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'DocumentUserCommentsAction' })

const comment = defineModel({ type: String, default: '' })
const emit = defineEmits(['submit'])

function onSubmit() {
  emit('submit', comment.value)
  comment.value = ''
}
</script>

<template>
  <b-form class="document-user-comments-form d-flex flex-column gap-2" @submit.prevent="onSubmit">
    <b-form-textarea
      v-model="comment"
      :rows="3"
      :max-rows="8"
      :placeholder="$t('documentUserCommentsForm.placeholder')"
    />
    <div class="d-flex justify-content-end gap-2">
      <button-icon type="submit" variant="action">
        {{ $t('documentUserCommentsForm.submit') }}
      </button-icon>
    </div>
  </b-form>
</template>
