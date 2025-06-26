<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import NavigationBreadcrumbDropdownEntry from '@/components/NavigationBreadcrumb/NavigationBreadcrumbDropdownEntry'

defineProps({
  routes: {
    type: Array,
    default: () => []
  },
  noCaret: {
    type: Boolean,
    default: false
  },
  noIcon: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="navigation-breadcrumb-dropdown">
    <b-dropdown
      toggle-class="navigation-breadcrumb-dropdown__toggle"
      teleport-to="body"
      menu-class="navigation-breadcrumb-dropdown__menu"
      variant="link"
      no-caret
    >
      <template #button-content>
        <slot name="button-content">
          <phosphor-icon :name="PhDotsThree" />
        </slot>
      </template>
      <slot>
        <navigation-breadcrumb-dropdown-entry v-for="route in routes" :key="route.name" :to="route" :no-icon="noIcon" />
      </slot>
    </b-dropdown>
    <phosphor-icon
      v-if="!noCaret"
      role="separator"
      aria-hidden="true"
      class="navigation-breadcrumb-dropdown__caret mx-2"
      size="1em"
      :name="PhCaretRight"
    />
  </div>
</template>

<style lang="scss">
.navigation-breadcrumb-dropdown {
  display: inline-flex;
  align-items: center;
  color: var(--bs-primary-color);

  &__toggle {
    --bs-btn-color: var(--bs-body-color);
    --bs-btn-border-color: transparent;
    --bs-btn-hover-border-color: var(--bs-primary);
    --bs-btn-border-radius: 0;
    --bs-btn-border-width: 0;
    --bs-btn-padding-x: 0;
    --bs-btn-padding-y: #{$spacer-xxs};
    --bs-btn-line-height: var(--bs-body-line-height);

    border-bottom: 1px solid var(--bs-btn-border-color);
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
