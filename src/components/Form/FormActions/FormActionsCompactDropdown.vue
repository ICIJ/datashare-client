<script setup>
import { computed, provide, watch } from 'vue'
import IPhDotsThreeOutlineVerticalFill from '~icons/ph/dots-three-outline-vertical-fill'

import AppDropdown from '@/components/AppDropdown/AppDropdown'
import { useScrollParent } from '@/composables/useScrollParent'

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
    type: [String, Object, Array],
    default: () => IPhDotsThreeOutlineVerticalFill
  },
  teleportTo: {
    type: [String, Object],
    default: null
  }
})

watch(
  () => props.size,
  () => provide('size', props.size),
  { immediate: true }
)

const scrollParent = useScrollParent()
const teleportToOrScrollParent = computed(() => props.teleportTo || scrollParent.value)
</script>

<template>
  <app-dropdown
    :variant="variant"
    :size="size"
    :button-icon="dropdownIcon"
    :teleport-to="teleportToOrScrollParent"
    menu-class="app-dropdown__menu form-actions-compact-dropdown__menu"
    toggle-class="app-dropdown__toggle form-actions-compact-dropdown__toggle"
    boundary="viewport"
    auto-close
    end
  >
    <li>
      <slot />
    </li>
  </app-dropdown>
</template>

<style lang="scss">
.form-actions-compact-dropdown {
  &__toggle {
    --form-actions-compact-dropdown-toggle-padding-y: calc(var(--bs-btn-padding-y) - 0.1em);

    padding-top: var(--form-actions-compact-dropdown-toggle-padding-y);
    padding-bottom: var(--form-actions-compact-dropdown-toggle-padding-y);
  }

  &__menu {
    & > li > .btn,
    & > li > .button-icon.btn {
      display: flex;
      min-width: 100%;

      &.button-icon--use-injected-variant {
        --bs-btn-border-width: 0;
        --bs-btn-bg: transparent;
        --bs-btn-color: var(--bs-dropdown-link-color);
        --bs-btn-hover-bg: var(--bs-dropdown-link-hover-bg);
        --bs-btn-hover-color: var(--bs-dropdown-link-hover-color);
      }
    }
  }
}
</style>
