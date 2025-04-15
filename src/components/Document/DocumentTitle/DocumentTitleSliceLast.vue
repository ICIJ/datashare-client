<script setup>
defineOptions({
  name: 'DocumentTitleSliceLast'
})

defineProps({
  slice: {
    type: String,
    required: true
  }
})
</script>

<template>
  <span class="document-title-slice-last">
    {{ slice }}
  </span>
</template>
