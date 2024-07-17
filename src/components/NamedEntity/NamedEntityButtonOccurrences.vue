<script setup>
defineProps({
  occurrences: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <div class="named-entity-button-occurrences badge rounded-pill text-tertiary-emphasis  bg-transparent">
    {{ $n(occurrences) }}
  </div>
</template>

<style lang="scss" scoped>
.named-entity-button-occurrences {
  border: 1px solid currentColor;
}
</style>
