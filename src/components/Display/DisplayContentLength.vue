<script setup>
import humanSize from '@/utils/humanSize'

defineProps({
  value: {
    type: [String, Number]
  }
})
</script>

<template>
  <span>{{ humanSize(value, false, $tm('human.size')) }}</span>
</template>
