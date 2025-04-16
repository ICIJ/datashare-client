<script setup>
import { computed } from 'vue'
import { compact, trim } from 'lodash'

const props = defineProps({
  label: {
    type: String,
    default: ''
  }
})

const rows = computed(() => {
  return compact(props.label.split('\n').map(trim))
})
</script>

<template>
  <div class="empty-state-label fw-medium">
    <slot v-bind="{ label, rows }">
      <p v-for="(row, i) in rows" :key="i" class="mb-0">{{ row }}</p>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.empty-state-label {
  color: var(--bs-body-color);
}
</style>
