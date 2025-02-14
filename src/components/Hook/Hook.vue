<script setup>
import { computed, defineProps } from 'vue'

import { useCore } from '@/composables/core'
import { useHooksStore } from '@/store/modules/hooks'

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
const isDebug = computed(() => core.config.is('hooksDebug'))
</script>

<template>
  <component :is="debugTag" v-if="isDebug" class="hook-debug" :aria-hook="name" :aria-count="components.length" />
  <component :is="component" v-for="({ component }, i) of components" :key="i" v-bind="bind" :class="xClass" />
</template>

<style lang="scss">
.hook-debug {
  position: relative;
  white-space: nowrap;
  height: 0;
  width: 0;

  &:before {
    content: attr(aria-hook) ' → ' attr(aria-count);
    font-size: 0.8rem;
    font-weight: bold;
    color: $secondary;
    text-shadow: 0 0 0.5em black;
    background: rgba(black, 0.7);
    font-family: $font-family-monospace;
    padding: 0.1em 0.3em;
  }
}
</style>
