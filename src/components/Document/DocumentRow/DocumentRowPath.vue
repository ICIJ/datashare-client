<script setup>
import DisplayPath from '@/components/Display/DisplayPath'

defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td>
    <display-path :value="document.path" />
  </td>
</template>
