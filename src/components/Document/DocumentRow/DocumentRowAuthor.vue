<script setup>
defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td>
    {{ document.author }}
  </td>
</template>
