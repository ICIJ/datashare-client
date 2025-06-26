<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { PhosphorIcon } from '@icij/murmur-next'
import { PhCaretRight } from '@phosphor-icons/vue'

import DisplayRoute from '@/components/Display/DisplayRoute'

const props = defineProps({
  to: {
    type: Object
  },
  currentRouteName: {
    type: String
  },
  noCaret: {
    type: Boolean
  },
  noIcon: {
    type: Boolean
  },
  active: {
    type: Boolean,
    default: null
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
    return router.resolve(props.to)
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
      <phosphor-icon v-if="!noIcon && icon" class="navigation-breadcrumb-link__label__icon me-2" :name="icon" />
      <span class="navigation-breadcrumb-link__label__content">
        <slot>
          <display-route :value="to.name" :title="title" />
        </slot>
      </span>
    </span>
  </a>
  <phosphor-icon
    v-if="route && !noCaret"
    role="separator"
    aria-hidden="true"
    class="navigation-breadcrumb-link__caret mx-2"
    size="1em"
    :name="PhCaretRight"
  />
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
