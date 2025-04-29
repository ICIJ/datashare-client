<script setup>
import { computed } from 'vue'

const props = defineProps({
  indices: {
    type: String,
    required: true
  },
  query: {
    type: String,
    required: true
  }
})

const to = computed(() => {
  const name = 'search'
  const query = { q: props.query, indices: props.indices }
  return { name, query }
})
</script>

<template>
  <router-link :to="to">
    <slot />
  </router-link>
</template>
