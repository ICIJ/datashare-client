<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Array
  }
})

const tags = computed(() => {
  const toHashtag = (tag) => `#${tag}`
  return props.value.map(toHashtag).join(' ')
})
</script>

<template>
  {{ tags }}
</template>
