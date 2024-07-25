<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

defineProps({
  active: {
    type: Boolean
  },
  icon: {
    type: String
  },
  count: {
    type: Number,
    default: null
  },
  activeClass: {
    type: String
  },
  disabled: {
    type: Boolean
  },
  exactActiveClass: {
    type: String
  },
  href: {
    type: String
  },
  rel: {
    type: String
  },
  target: {
    type: String
  },
  to: {
    type: Object
  }
})
</script>

<template>
  <b-nav-item
    class="navigation-tabs-entry"
    :active="active"
    :active-class="activeClass"
    :disabled="disabled"
    :exact-active-class="exactActiveClass"
    :href="href"
    :rel="rel"
    :target="target"
    :to="to"
  >
    <template v-if="icon">
      <phosphor-icon
        :name="icon"
        class="navigation-tabs-entry__icon navigation-tabs-entry__icon--inactive me-1"
        size="1.25em"
        aria-hidden="true"
      />
      <phosphor-icon
        :name="icon"
        class="navigation-tabs-entry__icon navigation-tabs-entry__icon--active me-1"
        weight="bold"
        size="1.25em"
        aria-hidden="true"
      />
    </template>
    <slot />
    <b-badge v-if="count !== null" variant="transparent" pill class="ms-1">
      {{ count }}
    </b-badge>
  </b-nav-item>
</template>

<style lang="scss" scoped>
.navigation-tabs-entry {
  &:deep(.nav-link) {
    --color: var(--bs-secondary-text-emphasis);

    color: var(--color);
    padding: 10px $spacer-xs;
    display: flex;
    align-items: center;

    .navigation-tabs-entry__icon--active {
      display: none;
    }

    &.active,
    &.router-link-active {
      --color: var(--bs-emphasis-color);
      border-bottom: 2px solid var(--bs-primary);
      font-weight: 500;

      .nav-tabs.flex-column > & {
        border-left: 2px solid var(--bs-primary);
      }

      .navigation-tabs-entry__icon--inactive {
        display: none;
      }

      .navigation-tabs-entry__icon--active {
        display: block;
      }
    }

    &.nav-link:hover {
      --color: var(--bs-emphasis-color);
      border-color: var(--bs-primary);

      .nav-tabs.flex-column > & {
        border-left: 2px solid var(--bs-primary);
      }
    }

    .nav-tabs.flex-column > & {
      border-bottom: 0;
      padding: 0 $spacer;
      border-left: 2px solid transparent;
    }
  }

  &:deep(.badge) {
    background: var(--color);
    color: var(--bs-body-bg);
    transition: $transition-base;
  }
}
</style>
