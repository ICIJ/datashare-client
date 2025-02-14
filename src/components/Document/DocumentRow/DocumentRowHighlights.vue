<script setup>
import DisplayHighlights from '@/components/Display/DisplayHighlights'

defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td class="text-beak">
    <display-highlights :value="document.highlights" />
  </td>
</template>
