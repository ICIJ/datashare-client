<script setup>
import { computed } from 'vue'
import { capitalize, isFunction, isString } from 'lodash'
import { useRouter } from 'vue-router'
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'
import { PhCaretRight } from '@phosphor-icons/vue'

import { useCore } from '@/composables/core'

const props = defineProps({
  routeName: {
    type: String
  },
  currentRouteName: {
    type: String
  },
  noCaret: {
    type: Boolean
  },
  active: {
    type: Boolean
  },
  icon: {
    type: [String, Object, Array]
  },
  title: {
    type: String
  }
})

const router = useRouter()

const currentRoute = computed(() => {
  const name = props.currentRouteName ?? router.currentRoute.value?.name
  try {
    return router.resolve({ name })
  } catch {
    return null
  }
})

const resolved = computed(() => {
  try {
    const name = props.routeName
    return router.resolve({ name })
  } catch {
    return null
  }
})

const route = computed(() => {
  try {
    // Find all the children routes (if any) of the given route
    const { children = [] } = resolved.value.matched[resolved.value.matched.length - 1]
    // Then we replace the current route by the first child route
    // that has an empty path (which is the direct child of the current route)
    // in order to display the correct breadcrumb link.
    //
    // If no child route has an empty path, we keep the current route.
    return children.find((child) => child.path === '') ?? resolved
  } catch {
    return null
  }
})

const { core } = useCore()
const { t } = useI18n()

const display = computed(() => {
  return (
    // Use the provided title from props
    props.title ||
    // Or use the title from the route meta as a function
    (isFunction(resolved.value?.meta?.title) && resolved.value?.meta?.title({ route: resolved.value, core })) ||
    // Or use the title from the route meta as a translation key
    (isString(resolved.value?.meta?.title) && t(resolved.value?.meta?.title)) ||
    // Or use the last part of the route name
    capitalize(resolved.value?.name.split('.').pop())
  )
})

const icon = computed(() => {
  return props.icon ?? resolved.value?.meta?.icon
})

const isActive = computed(() => {
  return props.active ?? resolved.value.name === currentRoute.value?.name
})

const classList = computed(() => {
  return {
    'navigation-breadcrumb-link--active': isActive.value
  }
})
</script>

<template>
  <a v-if="route" :href="resolved.href" class="navigation-breadcrumb-link" :class="classList">
    <span class="navigation-breadcrumb-link__label">
      <phosphor-icon v-if="icon" class="navigation-breadcrumb-link__label__icon me-2" :name="icon" />
      <span class="navigation-breadcrumb-link__label__content">
        <slot>{{ display }}</slot>
      </span>
    </span>
    <phosphor-icon
      v-if="!noCaret"
      role="separator"
      aria-hidden="true"
      class="navigation-breadcrumb-link__caret mx-2"
      size="1em"
      :name="PhCaretRight"
    />
  </a>
</template>

<style lang="scss" scoped>
.navigation-breadcrumb-link {
  display: inline-flex;
  align-items: center;
  color: var(--bs-primary-color);
  padding: 0;

  &__label {
    padding: $spacer-xxs 0;
    border-bottom: 1px solid transparent;

    .navigation-breadcrumb-link:not(.navigation-breadcrumb-link--active) &__icon + &__content {
      @include media-breakpoint-down(md) {
        display: none;
      }
    }
  }

  &--active,
  &:hover {
    color: var(--bs-body-color);

    .navigation-breadcrumb-link__label {
      border-bottom: 1px solid var(--bs-primary);
    }
  }
}
</style>
