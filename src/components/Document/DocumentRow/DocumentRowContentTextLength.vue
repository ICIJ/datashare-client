<script setup>
import DisplayContentLength from '@/components/Display/DisplayContentLength'

defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td>
    <display-content-length :value="document.contentTextLength" />
  </td>
</template>
