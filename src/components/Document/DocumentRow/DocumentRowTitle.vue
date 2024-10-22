<script setup>
defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td>
    {{ document.title }}
  </td>
</template>
