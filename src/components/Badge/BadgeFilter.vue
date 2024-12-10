<script setup>
import BadgeFilterHeader from './BadgeFilterHeader'
import BadgeFilterValue from './BadgeFilterValue'

defineProps({
  name: {
    type: String,
    required: true
  },
  value: {
    type: [String, Array, Number, Date, Boolean],
    required: true
  }
})
</script>

<template>
  <span class="badge-filter px-2 py-1 rounded border border-light-subtle d-inline-flex flex-column">
    <badge-filter-header class="mb-1" :name="name" />
    <badge-filter-value :name="name" :value="value" />
  </span>
</template>

<style lang="scss" scoped>
.badge-filter {
  max-width: 20rem;
}
</style>
