<script setup>
defineProps({
  document: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="image-viewer m-auto p-3">
    <img :src="document.inlineFullUrl" class="d-inline-block img-fluid" />
  </div>
</template>
