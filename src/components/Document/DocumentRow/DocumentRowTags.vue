<script setup>
import DisplayTags from '@/components/Display/DisplayTags'

defineProps({
  document: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <td>
    <display-tags :value="document.tags" />
  </td>
</template>
