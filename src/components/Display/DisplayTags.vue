<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true
  }
})

const toHashtag = (tag) => `#${tag}`
const tags = computed(() => {
  return props.modelValue.map(toHashtag).join(' ')
})
</script>

<template>
  <span class="text-action-emphasis">{{ tags }}</span>
</template>
