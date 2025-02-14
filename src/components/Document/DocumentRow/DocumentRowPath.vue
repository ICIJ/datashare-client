<script setup>
defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td>
    {{ document.path }}
  </td>
</template>
