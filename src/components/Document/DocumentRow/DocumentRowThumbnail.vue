<script setup>
import DocumentThumbnail from '@/components/Document/DocumentThumbnail'

defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td>
    <document-thumbnail :document="document" crop lazy :size="32" />
  </td>
</template>
