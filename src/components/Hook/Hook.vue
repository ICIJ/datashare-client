<script setup>
import { computed } from 'vue'

import { useCore } from '@/composables/useCore'
import { useHooksStore } from '@/store/modules'

const { name } = defineProps({
  /**
   * Name of the hook (targeted by plugins).
   */
  name: {
    type: String
  },
  /**
   * Specify the HTML tag to render the debug tag instead of the default tag.
   */
  debugTag: {
    type: String,
    default: 'span'
  },
  /**
   * Properties to pass to each hooks.
   */
  bind: {
    type: Object,
    default: () => {}
  },
  /**
   * Pass along the class to the rendered node.
   */
  xClass: {
    type: String
  }
})

const { core } = useCore()
const hooksStore = useHooksStore()
const components = computed(() => hooksStore.filterComponentsByTarget(name))
const title = computed(() => `${name} (${components.value.length})`)
const isDebug = computed(() => core.config.is('hooksDebug'))
</script>

<template>
  <component :is="debugTag" v-if="isDebug" class="hook-debug" :title="title" />
  <component :is="component" v-for="({ component }, i) of components" :key="i" v-bind="bind" :class="xClass" />
</template>

<style lang="scss">
.hook-debug {
  position: relative;
  white-space: nowrap;
  display: inline;
  height: 0;
  width: 0;
  flex: 0;
  color: var(--bs-emphasis-color);
  filter: drop-shadow(0 0 0.5rem var(--bs-body-bg));

  &:hover {
    color: var(--bs-primary);
    cursor: help;
  }

  &:before,
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 0.5rem;
    width: 0.5rem;
  }

  &:before {
    border-bottom: 1px solid currentColor;
    border-right: 1px solid currentColor;
    transform: translate(-100%, -100%);
  }

  &:after {
    border-top: 1px solid currentColor;
    border-left: 1px solid currentColor;
    transform: translate(-1px, -1px);
  }
}
</style>
