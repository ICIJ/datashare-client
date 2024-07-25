<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

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
    type: String,
    default: 'plus'
  },
  actionTitle: {
    type: String
  },
  icon: {
    type: String
  }
})

const classList = computed(() => {
  return {
    'app-sidebar-section-entry--compact': props.compact,
    'app-sidebar-section-entry--active': props.active
  }
})
</script>

<template>
  <div class="app-sidebar-section-entry d-flex align-entrys-center flex-truncate" :class="classList">
    <router-link :to="to" class="app-sidebar-section-entry__link text-truncate flex-grow-1">
      <phosphor-icon class="app-sidebar-section-entry__link__icon me-2" :name="icon" />
      <slot>{{ title }}</slot>
    </router-link>
    <router-link
      v-if="actionTo"
      v-b-tooltip.right
      :to="actionTo"
      class="app-sidebar-section-entry__action ms-2"
      :title="actionTitle"
    >
      <phosphor-icon class="app-sidebar-section-entry__action__icon" hover-weight="bold" :name="actionIcon" />
      <span class="visually-hidden">{{ actionTitle }}</span>
    </router-link>
  </div>
</template>

<style scoped lang="scss">
.app-sidebar-section-entry {
  position: relative;

  &--active {
    font-weight: 500;
  }

  &--active:before,
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
