<script setup>
import humanSize from '@/utils/humanSize'

defineProps({
  value: {
    type: [String, Number]
  }
})
</script>

<template>
  {{ humanSize(value, false, $tm('human.size')) }}
</template>
