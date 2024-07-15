<script setup>
import { computed } from 'vue'
import { capitalize, isFunction } from 'lodash'
import { useRouter } from 'vue-router'
import { PhosphorIcon } from '@icij/murmur-next'

function castFunction(value) {
  if (isFunction(value)) {
    return value
  }
  return () => value
}

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
    type: String
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

const route = computed(() => {
  try {
    return router.resolve({ name: props.routeName })
  } catch {
    return null
  }
})

const routeLocation = computed(() => {
  const { name, params, query } = route.value ?? {}
  return { name, params, query }
})

const title = computed(() => {
  const name = route.value?.name.split('.').pop()
  const fn = castFunction(props.title ?? route.value?.meta?.title ?? capitalize(name))
  return fn()
})

const icon = computed(() => {
  return props.icon ?? route.value?.meta?.icon
})

const isActive = computed(() => {
  return props.active || route.value.name === currentRoute.value?.name
})

const classList = computed(() => {
  return {
    'navigation-breadcrumb-link--active': isActive.value
  }
})
</script>

<template>
  <router-link v-if="route" :to="routeLocation" class="navigation-breadcrumb-link" :class="classList">
    <span class="navigation-breadcrumb-link__label">
      <phosphor-icon v-if="icon" class="navigation-breadcrumb-link__label__icon me-2" :name="icon" />
      <span class="navigation-breadcrumb-link__label__content">
        <slot>{{ title }}</slot>
      </span>
    </span>
    <phosphor-icon
      v-if="!noCaret"
      role="separator"
      aria-hidden="true"
      class="navigation-breadcrumb-link__caret mx-2"
      size="1em"
      name="caret-right"
    />
  </router-link>
</template>

<style lang="scss" scoped>
.navigation-breadcrumb-link {
  display: inline-flex;
  align-items: center;
  color: var(--bs-secondary-color);
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
      border-bottom: 1px solid var(--bs-secondary);
    }
  }
}
</style>
