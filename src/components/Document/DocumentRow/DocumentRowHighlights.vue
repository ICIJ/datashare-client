<script setup>
defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td>
    <div v-html="document.highlights.join(' … ')"></div>
  </td>
</template>
