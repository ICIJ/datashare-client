<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

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
  <button-icon
    :size="size"
    :label="label"
    class="form-control-tag-input-entry"
    icon-right="x"
    icon-right-variant="secondary"
    icon-right-hover-weight="bold"
    variant="light"
  />
</template>

<style lang="scss" scoped>
.form-control-tag-input-entry {
  --bs-btn-bg: var(--bs-action-bg-subtle);
  --bs-btn-color: var(--bs-body-color);
  --bs-btn-hover-bg: var(--bs-action-bg-subtle);
  --bs-btn-hover-color: var(--bs-body-color);
  --bs-btn-hover-border-color: var(--bs-secondary-border-subtle);
  --bs-btn-padding-y: 0;

  white-space: nowrap;
}
</style>
