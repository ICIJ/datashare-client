<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

defineProps({
  label: {
    type: String
  },
  icon: {
    type: String,
    default: 'tree-structure'
  }
})
</script>

<template>
  <div class="path-view-label d-flex gap-2 align-items-center">
    <phosphor-icon v-if="icon" :name="icon" />
    <div class="text-truncate">
      {{ label ?? $t('pathViewLabel.label') }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.path-view-label {
  font-size: 1.25rem;
  font-weight: 700;
}
</style>
