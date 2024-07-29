<script setup>
import IconButton from '@/components/IconButton'

defineProps({
  label: {
    type: String
  },
  size: {
    type: String,
    default: 'md'
  }
})
</script>

<template>
  <icon-button
    :size="size"
    :label="label"
    class="form-control-tag-entry"
    icon-right="x"
    icon-right-variant="tertiary"
    icon-right-hover-weight="bold"
    variant="light"
  />
</template>

<style lang="scss" scoped>
.form-control-tag-entry {
  --bs-btn-bg: var(--bs-action-bg-subtle);
  --bs-btn-color: var(--bs-body-color);
  --bs-btn-hover-bg: var(--bs-action-bg-subtle);
  --bs-btn-hover-color: var(--bs-body-color);
  --bs-btn-hover-border-color: var(--bs-secondary-border-subtle);
}
</style>
