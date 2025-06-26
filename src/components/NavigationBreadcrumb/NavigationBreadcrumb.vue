<script setup>
import { isString } from 'lodash'
import { computed, useSlots } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import NavigationBreadcrumbDropdown from '@/components/NavigationBreadcrumb/NavigationBreadcrumbDropdown'
import NavigationBreadcrumbLink from '@/components/NavigationBreadcrumb/NavigationBreadcrumbLink'

const props = defineProps({
  currentRouteName: {
    type: String
  },
  maxLevel: {
    type: Number,
    default: 3
  },
  routes: {
    type: Array
  }
})

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => {
  const name = props.currentRouteName ?? route.name
  try {
    return router.resolve({ name })
  } catch {
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

const visibleRoutes = computed(() => {
  // We only show the last `maxLevel` routes
  return allRoutes.value.slice(-props.maxLevel)
})

const hiddenRoutes = computed(() => {
  // We hide the first `maxLevel` routes
  return allRoutes.value.slice(0, Math.max(0, allRoutes.value.length - props.maxLevel))
})

const isActiveRoute = (name) => {
  return visibleRoutes.value[visibleRoutes.value.length - 1].name === name
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
const hasHiddenRoutes = computed(() => hiddenRoutes.value.length > 0)
</script>

<template>
  <div class="navigation-breadcrumb">
    <slot v-bind="{ currentRoute, matchedRoutes, routes, visibleRoutes }">
      <navigation-breadcrumb-dropdown v-if="hasHiddenRoutes" :routes="hiddenRoutes">
        <template v-for="{ name } in hiddenRoutes" #[`entry-label(${name})`]="binding" :key="name">
          <slot :name="`entry-label(${name})`" v-bind="binding" />
        </template>
      </navigation-breadcrumb-dropdown>
      <navigation-breadcrumb-link
        v-for="{ name } in visibleRoutes"
        :key="name"
        :to="{ name }"
        :current-route-name="currentRouteName"
        :active="isActiveRoute(name)"
      >
        <slot :name="`entry-label(${name})`" />
        <template v-if="showActiveSlot(name)">
          <slot name="active" />
        </template>
      </navigation-breadcrumb-link>
    </slot>
    <slot name="addon" />
  </div>
</template>

<style lang="scss" scoped>
.navigation-breadcrumb {
  display: flex;
  align-items: center;
  min-height: 3rem;
  flex-wrap: nowrap;
  white-space: nowrap;

  &:deep(.navigation-breadcrumb-link:last-of-type + .navigation-breadcrumb-link__caret) {
    display: none;
  }
}
</style>
