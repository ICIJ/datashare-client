<script setup>
defineProps({
  occurrences: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <div class="entity-occurrences badge rounded-pill text-secondary-emphasis bg-transparent">
    {{ $n(occurrences) }}
  </div>
</template>

<style lang="scss" scoped>
.entity-occurrences {
  border: 1px solid currentColor;

  .btn &.badge {
    top: 0;
  }
}
</style>
