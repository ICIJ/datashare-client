<script setup>
import { computed } from 'vue'

import ButtonAdd from '@/components/Button/ButtonAdd'
import ButtonToggleSidebar from '@/components/Button/ButtonToggleSidebar'
import ButtonToggleSettings from '@/components/Button/ButtonToggleSettings'
import Hook from '@/components/Hook/Hook'
import NavigationBreadcrumb from '@/components/NavigationBreadcrumb/NavigationBreadcrumb'
import PageContainer from '@/components/PageContainer/PageContainer'
import { useViews } from '@/composables/useViews'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { breakpointSizeValidator, SIZE } from '@/enums/sizes'

const { breakpointDown } = useBreakpoints()
const { toggleSettings, toggleSidebar } = useViews()

const props = defineProps({
  noBreadcrumb: {
    type: Boolean
  },
  noToggleSidebar: {
    type: Boolean
  },
  noToggleSettings: {
    type: Boolean
  },
  addLabel: {
    type: String
  },
  addTo: {
    type: Object
  },
  sidebarTogglerBreakpoint: {
    type: String,
    default: SIZE.MD,
    validator: breakpointSizeValidator
  }
})

const showToggleSidebar = computed(() => {
  return !props.noToggleSidebar && (!toggleSidebar.value || breakpointDown.value[props.sidebarTogglerBreakpoint])
})
</script>

<template>
  <page-container fluid class="page-header-nav d-flex justify-content-between gap-4">
    <hook name="page-header-nav:before" />
    <slot name="toggle-sidebar">
      <button-toggle-sidebar v-if="showToggleSidebar" v-model:active="toggleSidebar" class="flex-shrink-0" />
    </slot>
    <navigation-breadcrumb v-if="!noBreadcrumb" class="page-header-nav__breadcrumb me-auto">
      <slot name="breadcrumb" />
    </navigation-breadcrumb>
    <div class="page-header-nav__actions d-flex gap-4 ms-4 align-items-center">
      <slot name="actions" />
      <button-add v-if="addTo" :to="addTo" :label="addLabel" />
      <button-toggle-settings v-if="!noToggleSettings" v-model:active="toggleSettings" />
    </div>
    <hook name="page-header-nav:before" />
  </page-container>
</template>

<style lang="scss" scoped>
.page-header-nav {
  padding-block: $spacer;
  background: var(--bs-body-bg);
  max-width: 100vw;
  overflow: auto;

  &:has(+ .page-header-toolbar) {
    padding-bottom: 0;
  }
}
</style>
