<script setup>
import { AppIcon } from '@icij/murmur-next'
import IPhDotsThreeOutline from '~icons/ph/dots-three-outline'

import AppDropdown from '@/components/AppDropdown/AppDropdown'
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
    <app-dropdown
      teleport-to="body"
      variant="link"
      :button-icon="IPhDotsThreeOutline"
    >
      <slot>
        <navigation-breadcrumb-dropdown-entry
          v-for="route in routes"
          :key="route.name"
          :to="route"
          :no-icon="noIcon"
        >
          <slot :name="`entry-label(${route.name})`" />
        </navigation-breadcrumb-dropdown-entry>
      </slot>
    </app-dropdown>
    <app-icon
      v-if="!noCaret"
      role="separator"
      aria-hidden="true"
      class="navigation-breadcrumb-dropdown__caret mx-2"
      size="1em"
    >
      <i-ph-caret-right />
    </app-icon>
  </div>
</template>

<style lang="scss" scoped>
.navigation-breadcrumb-dropdown {
  display: inline-flex;
  align-items: center;
  color: var(--bs-primary-color);

  &:deep(.app-dropdown__toggle) {
    --bs-btn-color: var(--bs-body-color);
    --bs-btn-border-color: transparent;
    --bs-btn-hover-border-color: var(--bs-primary);
    --bs-btn-hover-bg: var(--bs-tertiary-bg-subtle);
    --bs-btn-border-radius: 0;
    --bs-btn-padding-x: 0;
    --bs-btn-padding-y: 0;
    --bs-btn-border-radius: 1rem;
    --bs-btn-line-height: 2rem;

    height: var(--bs-btn-line-height);
    width: var(--bs-btn-line-height);

    & > .app-icon {
      vertical-align: -0.32em;
    }
  }
}
</style>
