<script setup>
import { computed } from 'vue'

const { value } = defineProps({
  value: {
    type: String,
    required: true
  }
})

const short = computed(() => value.slice(0, 8))
</script>

<template>
  <span class="font-monospace">
    {{ short }}
  </span>
</template>
