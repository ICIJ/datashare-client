<script setup>
defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td class="text-beak">
    <div v-html="document.highlights.join(' … ')"></div>
  </td>
</template>
