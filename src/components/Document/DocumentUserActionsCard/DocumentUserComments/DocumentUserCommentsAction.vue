<script setup>
defineOptions({ name: 'DocumentUserCommentsAction' })

const comment = defineModel({
  type: String,
  required: true
})
defineProps({
  to: { type: String, default: '' },
  username: { type: String, default: '' }
})
const emit = defineEmits(['submit'])

function onReset() {
  comment.value = ''
}
function onSubmit() {
  emit('submit', {
    text: comment.value,
    date: Date.now()
  })
}
</script>

<template>
  <b-form id="form" class="d-flex flex-column gap-2" @submit.prevent="onSubmit" @reset="onReset">
    <b-form-textarea id="textarea" v-model="comment" placeholder="Write your text"></b-form-textarea>
    <div class="d-flex justify-content-end gap-2">
      <b-button type="reset" variant="outline-action">Clear</b-button>
      <b-button type="submit" variant="action">Comment</b-button>
    </div>
  </b-form>
</template>

<style scoped lang="scss"></style>
