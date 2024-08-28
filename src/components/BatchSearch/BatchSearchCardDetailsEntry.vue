<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
defineOptions({ name: 'BatchSearchCardDetailsEntry' })
defineProps({
  icon: {
    type: String
  },
  label: {
    type: String
  },
  value: { type: String }
})
</script>

<template>
  <span class="batch-search-card-details-entry d-inline-flex align-items-center gap-2" :title="label"
    ><phosphor-icon
      v-if="icon"
      :name="icon"
      class="batch-search-card-details-entry__icon text-secondary-emphasis"
    /><slot>{{ value }}</slot></span
  >
</template>
<style scoped lang="scss">
.batch-search-card-details-entry {
  &__icon {
    width: 27.5px;
  }
}
</style>
