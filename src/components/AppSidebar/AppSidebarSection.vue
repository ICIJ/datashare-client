<script setup>
import { computed } from 'vue'

import AppSidebarSectionToggler from '@/components/AppSidebar/AppSidebarSectionToggler'
import AppSidebarSectionTitle from '@/components/AppSidebar/AppSidebarSectionTitle'
import Hook from '@/components/Hook/Hook'

const props = defineProps({
  compact: {
    type: Boolean
  },
  title: {
    type: String
  },
  icon: {
    type: [String, Object, Array]
  },
  active: {
    type: Boolean
  },
  to: {
    type: Object
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
    <hook name="app-sidebar-section:before" :bind="{ title, to, compact, active }" />
    <app-sidebar-section-toggler v-if="compact" :title="title" :icon="icon" :active="active" :to="to" />
    <template v-else>
      <slot name="title">
        <app-sidebar-section-title class="p-3" :title="title" :icon="icon" :compact="compact" />
      </slot>
      <div class="app-sidebar-section__entries ms-4 px-3 pb-3">
        <hook name="app-sidebar-section-entries:before" :bind="{ title, to, compact, active }" />
        <slot />
        <hook name="app-sidebar-section-entries:after" :bind="{ title, to, compact, active }" />
      </div>
    </template>
    <hook name="app-sidebar-section:after" :bind="{ title, to, compact, active }" />
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
