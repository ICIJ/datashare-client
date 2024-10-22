<script setup>
import DisplayContentType from '@/components/Display/DisplayContentType'

defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td>
    <display-content-type :value="document.contentType" />
  </td>
</template>
