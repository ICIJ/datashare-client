<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  occurrences: {
    type: Number,
    default: 0
  }
})
const { n } = useI18n()
</script>

<template>
  <div class="entity-occurrences badge rounded-pill text-secondary-emphasis bg-transparent">
    {{ n(occurrences) }}
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
