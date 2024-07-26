<script setup>
import DisplayContentLength from '@/components/Display/DisplayContentLength'

defineProps({
  value: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <div class="path-view-entry-stats-size d-flex align-items-center px-2 py-1">
    <display-content-length :value="value" />
  </div>
</template>

<style lang="scss" scoped>
.path-view-entry-stats-size {
  color: var(--bs-secondary-color);
}
</style>
