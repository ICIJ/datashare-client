<script setup>
defineOptions({
  name: 'DocumentTitleSubject'
})

defineProps({
  subject: {
    type: String,
    required: true
  }
})
</script>

<template>
  <span class="document-title-subject">
    {{ subject }}
  </span>
</template>
