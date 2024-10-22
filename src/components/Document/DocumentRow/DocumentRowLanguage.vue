<script setup>
import DisplayLanguage from '@/components/Display/DisplayLanguage'

defineProps({
  document: {
    type: Object
  }
})
</script>

<template>
  <td>
    <display-language :value="document.language" />
  </td>
</template>
