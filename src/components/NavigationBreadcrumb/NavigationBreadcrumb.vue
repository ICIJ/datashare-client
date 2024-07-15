<script setup>
import { computed, useSlots } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import NavigationBreadcrumbLink from '@/components/NavigationBreadcrumb/NavigationBreadcrumbLink'

const props = defineProps({
  currentRouteName: {
    type: String
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
  if (currentRoute.value) {
    return currentRoute.value?.matched ?? []
  }
  return []
})

const isActiveRoute = (name) => {
  return name === currentRoute.value?.name
}

const showActiveSlot = (name) => {
  return hasActiveSlot.value && isActiveRoute(name)
}

const hasActiveSlot = computed(() => {
  return 'active' in useSlots()
})
</script>

<template>
  <div class="navigation-breadcrumb">
    <slot v-bind="{ currentRoute, matchedRoutes }">
      <navigation-breadcrumb-link
        v-for="{ name } in matchedRoutes"
        :key="name"
        :route-name="name"
        :current-route-name="currentRouteName"
        :no-caret="name === currentRouteName"
      >
        <template v-if="showActiveSlot(name)">
          <slot name="active" />
        </template>
      </navigation-breadcrumb-link>
    </slot>
    <slot name="addon"></slot>
  </div>
</template>

<style lang="scss" scoped>
.navigation-breadcrumb {
  display: flex;
  align-items: center;
  min-height: 3rem;
  flex-wrap: nowrap;
  white-space: nowrap;

  &:deep(.navigation-breadcrumb-link:last-of-type .navigation-breadcrumb-link__caret) {
    display: none;
  }
}
</style>
