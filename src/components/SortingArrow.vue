<template>
  <span>
      <fa :icon="icon" fixed-width :class="{'disabled-arrow':disabled}" />
  </span>
</template>
<script setup>
  import { computed } from 'vue'
  const  props = defineProps(['sortBy', 'fieldKey'])
  const isAsc = computed(() => props.sortBy.key === props.fieldKey && props.sortBy.order.toLowerCase() === 'asc')
  const isDesc = computed(() => props.sortBy.key === props.fieldKey && props.sortBy.order.toLowerCase() === 'desc')
  const icon = computed(() => isDesc.value ?  'arrow-down' : 'arrow-up')
  const disabled = computed(() => !(isAsc.value || isDesc.value))
</script>

<style scoped lang="scss">
  .disabled-arrow {
    opacity: 0.4;
  }
</style>