<script setup>
import { computed, provide, watch } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

const props = defineProps({
  variant: {
    type: String,
    default: 'action'
  },
  size: {
    type: String,
    default: 'md'
  },
  dropdownIcon: {
    type: String,
    default: 'dots-three-outline-vertical'
  }
})

watch(
  () => props.size,
  () => provide('size', props.size),
  { immediate: true }
)

const classList = computed(() => {
  return [`form-actions-compact-dropdown--${props.variant}`]
})

const menuClassList = computed(() => {
  const variant = props.variant.replace('outline-', '')
  return ['form-actions-compact-dropdown__menu', `form-actions-compact-dropdown__menu--${variant}`]
})
</script>

<template>
  <b-dropdown
    :variant="variant"
    :size="size"
    :class="classList"
    :menu-class="menuClassList"
    toggle-class="form-actions-compact-dropdown__toggle"
    boundary="viewport"
    teleport-to="body"
    no-caret
  >
    <li>
      <slot />
    </li>
    <template #button-content>
      <phosphor-icon :name="dropdownIcon" />
    </template>
  </b-dropdown>
</template>

<style lang="scss">
.form-actions-compact-dropdown {
  &__menu {
    --bs-form-actions-compact-dropdown-bg: var(--bs-body-bg);
    --bs-form-actions-compact-dropdown-border-color: var(--bs-border-color);
    --bs-form-actions-compact-dropdown-color: var(--bs-body-color);

    --bs-form-actions-compact-dropdown-btn-color: var(--bs-link-color);
    --bs-form-actions-compact-dropdown-btn-hover-bg: transparent;
    --bs-form-actions-compact-dropdown-btn-hover-color: var(--bs-link-hover-color);

    background: var(--bs-form-actions-compact-dropdown-bg);
    border-color: var(--bs-form-actions-compact-dropdown-border-color);
    color: var(--bs-form-actions-compact-dropdown-color);

    @each $variant, $value in $theme-colors {
      &--#{$variant} {
        --bs-form-actions-compact-dropdown-bg: var(--bs-#{$variant}-bg-subtle);
        --bs-form-actions-compact-dropdown-border-color: var(--bs-#{$variant}-border);
        --bs-form-actions-compact-dropdown-color: var(--bs-#{$variant}-text-emphasis);

        --bs-form-actions-compact-dropdown-btn-color: var(--bs-#{$variant}-text-emphasis);
        --bs-form-actions-compact-dropdown-btn-hover-bg: var(--bs-#{$variant});
        --bs-form-actions-compact-dropdown-btn-hover-color: #{color-contrast($value)};
      }
    }

    & > li > .btn {
      display: flex;
      min-width: 100%;

      &.button-icon--use-injected-variant {
        --bs-btn-border-width: 0;
        --bs-btn-bg: transparent;
        --bs-btn-color: var(--bs-form-actions-compact-dropdown-btn-color);
        --bs-btn-hover-bg: var(--bs-form-actions-compact-dropdown-btn-hover-bg);
        --bs-btn-hover-color: var(--bs-form-actions-compact-dropdown-btn-hover-color);
      }
    }
  }
}
</style>
