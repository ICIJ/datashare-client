<script setup>
import { computed } from 'vue'

const props = defineProps({
  compact: {
    type: Boolean
  },
  title: {
    type: String
  },
  icon: {
    type: String
  }
})

const classList = computed(() => {
  return {
    'app-sidebar-section--compact': props.compact
  }
})
</script>

<template>
  <section class="app-sidebar-section" :class="classList"></section>
</template>
