<script setup>
import DisplayDatetime from '@/components/Display/DisplayDatetime'

defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td>
    <display-datetime :value="document.creationDate" />
  </td>
</template>
