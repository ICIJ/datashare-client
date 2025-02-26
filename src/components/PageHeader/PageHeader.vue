<script setup>
import { computed } from 'vue'

import ButtonAdd from '@/components/Button/ButtonAdd'
import ButtonToggleSidebar from '@/components/Button/ButtonToggleSidebar'
import ButtonToggleSettings from '@/components/Button/ButtonToggleSettings'
import NavigationBreadcrumb from '@/components/NavigationBreadcrumb/NavigationBreadcrumb'
import PageContainer from '@/components/PageContainer/PageContainer'
import { useViews } from '@/composables/views'
import { useBreakpoints } from '@/composables/breakpoints'
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
  toAdd: {
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
  <page-container fluid class="page-header d-flex justify-content-between gap-4 py-3">
    <slot name="toggle-sidebar">
      <button-toggle-sidebar v-if="showToggleSidebar" v-model:active="toggleSidebar" class="flex-shrink-0" />
    </slot>
    <navigation-breadcrumb v-if="!noBreadcrumb" class="page-header__breadcrumb me-auto">
      <slot name="breadcrumb" />
    </navigation-breadcrumb>
    <div class="page-header__actions d-flex gap-4 ms-4">
      <slot name="action">
        <button-add v-if="toAdd" :to="toAdd" />
        <button-toggle-settings v-if="!noToggleSettings" v-model:active="toggleSettings" />
      </slot>
    </div>
  </page-container>
</template>

<style lang="scss" scoped>
.page-header {
  position: sticky;
  top: 0;
  z-index: $zindex-sticky;
  background: var(--bs-body-bg);
}
</style>
