<script setup>
defineOptions({ name: 'DocumentUserCommentsAction' })

const comment = defineModel({
  type: String,
  required: true
})
</script>

<template>
  <div>
    <b-form-textarea v-model="comment" placeholder="Write your text"></b-form-textarea>
  </div>
</template>

<style scoped lang="scss"></style>
