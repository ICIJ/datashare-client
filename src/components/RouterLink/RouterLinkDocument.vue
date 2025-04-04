<script setup>
import { computed } from 'vue'

const props = defineProps({
  index: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  routing: {
    type: String
  },
  q: {
    type: String
  }
})

const to = computed(() => ({
  name: 'document-standalone',
  params: {
    index: props.index,
    id: props.id,
    routing: props.routing
  },
  query: {
    q: props.q
  }
}))
</script>

<template>
  <router-link :to="to">
    <slot />
  </router-link>
</template>
