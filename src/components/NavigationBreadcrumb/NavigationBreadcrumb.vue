<script setup>
import { isString } from 'lodash'
import { computed, useSlots } from 'vue'
import { useRouter } from 'vue-router'

import NavigationBreadcrumbLink from '@/components/NavigationBreadcrumb/NavigationBreadcrumbLink'
import NavigationBreadcrumbDropdownEntry from '@/components/NavigationBreadcrumb/NavigationBreadcrumbDropdownEntry'

import ParentOverflowEntries from '@/components/ParentOverflow/ParentOverflowEntries'
import ParentOverflowEntriesItem from '@/components/ParentOverflow/ParentOverflowEntriesItem'

const props = defineProps({
  currentRouteName: {
    type: String
  },
  routes: {
    type: Array
  }
})

const router = useRouter()

const currentRoute = computed(() => {
  try {
    const name = props.currentRouteName ?? router.currentRoute.value.name
    return router.resolve({ name })
  }
  catch {
    return null
  }
})

const matchedRoutes = computed(() => {
  // We get all matching routes, including parent routes
  return (props.routes ?? currentRoute?.value?.matched ?? []).map(castRoute)
})

const allRoutes = computed(() => {
  return matchedRoutes.value.filter((route) => {
    return route.meta?.breadcrumb !== false && (route.name || route.meta?.title)
  })
})

const isActiveRoute = (name) => {
  return allRoutes.value[allRoutes.value.length - 1].name === name
}

const showActiveSlot = (name) => {
  return hasActiveSlot.value && isActiveRoute(name)
}

const castRoute = (nameOrRoute) => {
  if (isString(nameOrRoute)) {
    return { name: nameOrRoute }
  }
  return nameOrRoute
}

const hasActiveSlot = computed(() => 'active' in useSlots())
</script>

<template>
  <parent-overflow-entries
    :dropdown-button-icon="PhDotsThreeOutline"
    reverse
    class="navigation-breadcrumb flex-grow-1 flex-shrink-1"
  >
    <slot v-bind="{ currentRoute, matchedRoutes, routes, allRoutes }">
      <parent-overflow-entries-item
        v-for="route in allRoutes"
        :key="route.name"
        :label="route.name"
        :context="route"
      >
        <template #default="{ hasVisibleNext }">
          <navigation-breadcrumb-link
            :to="route"
            :current-route-name="currentRouteName"
            :active="isActiveRoute(route.name)"
            :no-caret="!hasVisibleNext"
          >
            <slot :name="`entry-label(${route.name})`" />
            <template v-if="showActiveSlot(route.name)">
              <slot name="active" />
            </template>
          </navigation-breadcrumb-link>
        </template>
      </parent-overflow-entries-item>
    </slot>
    <template #separator>
      <phosphor-icon
        class="mx-2"
        role="separator"
        aria-hidden="true"
        size="1em"
        :name="PhCaretRight"
      />
    </template>
    <template #dropdown-entry="{ entry }">
      <navigation-breadcrumb-dropdown-entry :to="entry.exposed.context" />
    </template>
  </parent-overflow-entries>
</template>

<style lang="scss" scoped>
.navigation-breadcrumb {
  display: flex;
  min-height: 3rem;
  white-space: nowrap;
  flex-grow: 1;
  flex-shrink: 1;
  align-items: center;
  overflow: hidden;
}
</style>
