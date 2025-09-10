<script setup>
import { VARIANT, variantValidator } from '@/enums/variants'

defineProps({
  variant: {
    type: String,
    validator: variantValidator,
    default: VARIANT.OUTLINE_SECONDARY
  },
  menuClass: {
    type: String,
    default: 'app-dropdown__menu'
  },
  toggleClass: {
    type: String,
    default: 'app-dropdown__toggle'
  },
  noCaret: {
    type: Boolean,
    default: true
  },
  autoClose: {
    type: [Boolean, String],
    default: 'outside'
  },
  buttonIcon: {
    type: [String, Object],
    default: PhDotsThreeOutlineVertical
  },
  buttonIconWeight: {
    type: String,
    default: 'fill'
  }
})
</script>

<template>
  <b-dropdown
    class="app-dropdown"
    :menu-class="menuClass"
    :toggle-class="toggleClass"
    :variant="variant"
    :no-caret="noCaret"
    :auto-close="autoClose"
  >
    <template #button-content>
      <slot name="button-content">
        <phosphor-icon
          :name="buttonIcon"
          :weight="buttonIconWeight"
        />
      </slot>
    </template>
    <slot />
  </b-dropdown>
</template>

<style lang="scss">
.app-dropdown {
  &__toggle {
    --bs-btn-border-width: 0;
  }

  &__menu {
    --bs-dropdown-zindex: #{$zindex-sticky};
    --bs-dropdown-bg: var(--bs-action-bg-subtle);
    --bs-dropdown-border-color: var(--bs-action);
    --bs-dropdown-color: var(--bs-action-text-emphasis);
    --bs-dropdown-link-color: var(--bs-link-color);
    --bs-dropdown-link-hover-bg: var(--bs-action);
    --bs-dropdown-link-hover-color: var(--bs-white);
  }
}
</style>
