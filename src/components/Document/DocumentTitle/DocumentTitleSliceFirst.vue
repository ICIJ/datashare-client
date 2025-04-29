<script setup>
defineOptions({
  name: 'DocumentTitleSliceFirst'
})

defineProps({
  slice: {
    type: String,
    required: true
  }
})
</script>

<template>
  <span class="document-title-slice-first">
    {{ slice }}
  </span>
</template>
