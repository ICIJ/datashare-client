<script setup>
import { computed, useTemplateRef } from 'vue'
import { useElementSize } from '@vueuse/core'

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
const element = useTemplateRef('element')
const { width: elementWidth } = useElementSize(element)

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
  },
  breadcrumbRoutes: {
    type: Array
  }
})

const showToggleSidebar = computed(() => {
  return !props.noToggleSidebar && (!toggleSidebar.value || breakpointDown.value[props.sidebarTogglerBreakpoint])
})

const breadcrumbMaxLevel = computed(() => {
  return Math.max(1, Math.round(elementWidth.value / 250))
})
</script>

<template>
  <page-container ref="element" fluid class="page-header-nav d-flex justify-content-between gap-3">
    <hook name="page-header-nav:before" />
    <slot name="toggle-sidebar">
      <button-toggle-sidebar v-if="showToggleSidebar" v-model:active="toggleSidebar" class="flex-shrink-0" />
    </slot>
    <navigation-breadcrumb
      v-if="!noBreadcrumb"
      class="page-header-nav__breadcrumb me-auto"
      :max-level="breadcrumbMaxLevel"
      :routes="breadcrumbRoutes"
    >
      <slot name="breadcrumb" />
      <!-- This forwards all the given slots to navgiation breadcrumb -->
      <template v-for="(_slot, name) of $slots" :key="name" #[name]="binding">
        <slot :name="name" v-bind="binding" />
      </template>
    </navigation-breadcrumb>
    <div class="page-header-nav__actions d-flex gap-1 gap-md-3 align-items-center">
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

  &__breadcrumb {
    flex-shrink: 1;
    overflow: auto;
  }

  &:has(+ .page-header-toolbar) {
    padding-bottom: 0;
  }
}
</style>
