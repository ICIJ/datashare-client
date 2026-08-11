<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AppIcon } from '@icij/murmur'
import IPhPlus from '~icons/ph/plus'

const props = defineProps({
  compact: {
    type: Boolean
  },
  active: {
    type: Boolean
  },
  title: {
    type: String
  },
  to: {
    type: Object
  },
  actionTo: {
    type: Object
  },
  actionIcon: {
    type: [String, Object, Array],
    default: () => IPhPlus
  },
  actionTitle: {
    type: String
  },
  icon: {
    type: [String, Object, Array]
  },
  exactMatch: {
    type: Boolean
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})

const classList = computed(() => {
  return {
    'app-sidebar-section-entry--compact': props.compact,
    'app-sidebar-section-entry--active': props.active,
    'app-sidebar-section-entry--exact-match': props.exactMatch
  }
})

const router = useRouter()

// Preload a nav target's route chunk(s) on hover/focus intent, before the
// user actually clicks. `router.resolve` + calling each matched record's
// component loader triggers the same dynamic import() the router would run
// on navigation; the browser's module cache makes repeat calls (re-hover,
// actual navigation) a no-op, so no extra fetch or dedup bookkeeping needed.
function preload(to) {
  if (!to) return
  for (const record of router.resolve(to).matched) {
    for (const component of Object.values(record.components ?? {})) {
      if (typeof component === 'function') component()
    }
  }
}
</script>

<template>
  <div
    class="app-sidebar-section-entry d-flex align-entrys-center flex-truncate"
    :class="classList"
  >
    <router-link
      :to="to"
      class="app-sidebar-section-entry__link text-truncate d-flex flex-grow-1"
      @mouseenter="preload(to)"
      @focus="preload(to)"
    >
      <app-icon
        class="app-sidebar-section-entry__link__icon me-2"
        size="1.25em"
        :name="icon"
      />
      <slot>{{ title }}</slot>
    </router-link>
    <router-link
      v-if="actionTo"
      v-b-tooltip.body.right="{ delay: tooltipDelay }"
      :to="actionTo"
      class="app-sidebar-section-entry__action ms-2 d-flex"
      :title="actionTitle"
      @mouseenter="preload(actionTo)"
      @focus="preload(actionTo)"
    >
      <app-icon
        class="app-sidebar-section-entry__action__icon"
        size="1.25em"
        :name="actionIcon"
      />
      <span class="visually-hidden">{{ actionTitle }}</span>
    </router-link>
  </div>
</template>

<style scoped lang="scss">
.app-sidebar-section-entry {
  position: relative;

  &--active,
  &:not(&--exact-match):has(.router-link-active),
  &:has(.router-link-exact-active) {
    font-weight: 500;
  }

  &--active:before,
  &:not(&--exact-match):has(.router-link-active):before,
  &:has(.router-link-exact-active):before,
  &:hover:before {
    content: '';
    position: absolute;
    left: -$spacer-xs;
    top: $spacer-xxs;
    bottom: $spacer-xxs;
    width: 2px;
    border-radius: 1px;
    background: var(--bs-primary);
  }

  &__action-icon {
    cursor: pointer;
    width: $font-size-base * $line-height-base;
    height: $font-size-base * $line-height-base;
  }

  &__link,
  &__action {
    cursor: pointer;
    color: inherit;
  }
}
</style>
