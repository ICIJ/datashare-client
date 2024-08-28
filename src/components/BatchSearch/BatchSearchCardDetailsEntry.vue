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
  <span class="batch-search-card-details-entry d-flex align-items-center justify-content-between gap-2" :title="label"
    ><span class="d-flex align-items-center gap-2"
      ><phosphor-icon
        v-if="icon"
        :name="icon"
        class="batch-search-card-details-entry__icon text-secondary-emphasis"
      /><slot>{{ value }}</slot></span
    ><span><slot name="end"></slot></span
  ></span>
</template>
<style scoped lang="scss">
.batch-search-card-details-entry {
  &__icon {
    width: 27.5px;
  }
}
</style>
