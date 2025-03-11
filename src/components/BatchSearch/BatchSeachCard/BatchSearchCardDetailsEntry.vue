<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

defineOptions({ name: 'BatchSearchCardDetailsEntry' })

defineProps({
  icon: {
    type: [String, Object, Array]
  },
  label: {
    type: String
  },
  value: { type: String }
})
</script>

<template>
  <div class="batch-search-card-details-entry d-flex align-items-center justify-content-between gap-2" :title="label">
    <div class="d-flex  flex-wrap align-items-center gap-2">
      <phosphor-icon
        v-if="icon"
        :name="icon"
        class="batch-search-card-details-entry__icon text-secondary-emphasis"
      />
      <slot>{{ value }}</slot>
    </div>
    <div>
      <slot name="end" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.batch-search-card-details-entry {
  &__icon {
    width: 1.75rem;
  }
}
</style>
