<script setup>
import DisplayExtractionLevel from '@/components/Display/DisplayExtractionLevel'

defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td>
    <display-extraction-level :value="document.extractionLevel" />
  </td>
</template>
