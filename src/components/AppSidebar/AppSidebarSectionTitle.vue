<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

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
    'app-sidebar-section-title--compact': props.compact
  }
})
</script>

<template>
  <h3 class="app-sidebar-section-title" :class="classList">
    <phosphor-icon class="me-2" :name="icon" />
    <slot>{{ title }}</slot>
  </h3>
</template>

<style lang="scss" scoped>
.app-sidebar-section-title {
  font-size: 1em;
  font-weight: 500;
  margin: 0;
}
</style>
