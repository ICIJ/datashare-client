<script setup>
import { computed } from 'vue'

import AppSidebarSectionToggler from '@/components/AppSidebar/AppSidebarSectionToggler'
import AppSidebarSectionTitle from '@/components/AppSidebar/AppSidebarSectionTitle'

const props = defineProps({
  compact: {
    type: Boolean
  },
  title: {
    type: String
  },
  icon: {
    type: String
  },
  active: {
    type: Boolean
  }
})

const classList = computed(() => {
  return {
    'app-sidebar-section--compact': props.compact
  }
})
</script>

<template>
  <section class="app-sidebar-section" :class="classList">
    <app-sidebar-section-toggler v-if="compact" :title="title" :icon="icon" :active="active" />
    <template v-else>
      <slot name="title">
        <app-sidebar-section-title class="p-3" :title="title" :icon="icon" :compact="compact" />
      </slot>
      <div class="app-sidebar-section__entries ms-4 px-3 pb-3">
        <slot />
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
.app-sidebar-section {
  background: var(--bs-body-bg);
  border-radius: var(--bs-border-radius);

  &:deep(.app-sidebar-section-entry):not(:last-of-type) {
    margin-bottom: $spacer-xs;
  }
}
</style>
