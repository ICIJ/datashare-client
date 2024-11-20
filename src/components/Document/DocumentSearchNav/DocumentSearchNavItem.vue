<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  icon: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean
  },
  tooltipPlacement: {
    type: String,
    default: 'top'
  }
})
</script>

<template>
  <button-icon
    class="document-search-nav-item"
    variant="outline-secondary"
    :tooltip-placement="tooltipPlacement"
    :icon-left="icon"
    icon-left-hover-weight="bold"
    :disabled="disabled"
    :label="label"
    square
    hide-label
  />
</template>

<style lang="scss" scoped>
.document-search-nav-item {
  --bs-btn-color: var(--bs-secondary-text-emphasis);
  --bs-btn-border-color: transparent;
  --bs-btn-hover-bg: var(--bs-primary);
  --bs-btn-hover-color: var(--bs-white);
  --bs-btn-hover-border-color: transparent;
  --bs-btn-active-bg: var(--bs-primary);
  --bs-btn-active-color: var(--bs-white);
  --bs-btn-disabled-border-color: transparent;
}
</style>
