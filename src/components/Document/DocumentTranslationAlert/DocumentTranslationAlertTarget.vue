<script setup>
import DisplayLanguage from '@/components/Display/DisplayLanguage'

defineProps({
  targetLanguage: {
    type: String,
    required: true
  }
})
</script>

<template>
  <display-language :value="targetLanguage" />
</template>
