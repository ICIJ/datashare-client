<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  active: {
    type: Boolean
  },
  title: {
    type: String
  },
  icon: {
    type: [String, Object, Array]
  },
  to: {
    type: Object,
    required: true
  }
})

const router = useRouter()
// We resolve the route to get the href because of
// of a bug in bootstrap-vue that doesn't allow to use
// router-link (with prop "to") and a tooltip.
const href = computed(() => router.resolve(props.to)?.href)

const classList = computed(() => {
  return {
    'app-sidebar-section-toggler--active': props.active
  }
})
</script>

<template>
  <button-icon
    :icon-left="icon"
    square
    hide-label
    variant="outline-primary"
    class="app-sidebar-section-toggler"
    tooltip-placement="right"
    :label="title"
    :href="href"
    :class="classList"
  >
    {{ title }}
  </button-icon>
</template>

<style lang="scss">
.app-sidebar-section-toggler {
  border-color: transparent;
  width: calc(#{$btn-line-height * $btn-font-size} + #{$spacer * 2} + #{$btn-border-width} * 2);
  height: calc(#{$btn-line-height * $btn-font-size} + #{$spacer * 2} + #{$btn-border-width} * 2);

  &:not(:hover) {
    color: var(--bs-body-color, inherit);
    background: var(--bs-body-bg);
  }

  &--active {
    border-color: var(--bs-primary);
  }
}
</style>
