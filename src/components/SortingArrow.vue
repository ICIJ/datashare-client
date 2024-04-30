<template>
  <span>
      <fa v-if="isAsc" icon="arrow-up" />
      <fa v-else-if="isDesc" icon="arrow-down" />
      <fa v-else icon="arrow-up" class="disabled-arrow" />
  </span>
</template>
<script setup>
  import { computed } from 'vue'
  const  props = defineProps(['sortBy', 'fieldKey'])
  const isAsc = computed(() => props.sortBy.key === props.fieldKey && props.sortBy.order.toLowerCase() === 'asc')
  const isDesc = computed(() => props.sortBy.key === props.fieldKey && props.sortBy.order.toLowerCase() === 'desc')
</script>

<style scoped lang="scss">
  .disabled-arrow {
    opacity: 0.4;
  }
</style>