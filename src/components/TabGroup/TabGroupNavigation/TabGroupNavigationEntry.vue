<script setup>
import { computed } from 'vue'

import TabGroupTitle from '@/components/TabGroup/TabGroupTitle'

const props = defineProps({
  manual: {
    type: Boolean
  },
  active: {
    type: Boolean
  },
  icon: {
    type: [String, Object, Array]
  },
  count: {
    type: Number,
    default: null
  },
  activeClass: {
    type: String
  },
  disabled: {
    type: Boolean
  },
  exactActiveClass: {
    type: String
  },
  href: {
    type: String
  },
  rel: {
    type: String
  },
  target: {
    type: String
  },
  to: {
    type: Object
  }
})

const classList = computed(() => {
  return {
    'tab-group-navigation-entry--active': props.active,
    'tab-group-navigation-entry--manual': props.manual
  }
})
</script>

<template>
  <b-nav-item
    class="tab-group-navigation-entry"
    :class="classList"
    :active="active"
    :active-class="activeClass"
    :exact-active-class="exactActiveClass"
    :disabled="disabled"
    :href="href"
    :rel="rel"
    :target="target"
    :to="to"
  >
    <tab-group-title
      :icon="icon"
      :count="count"
    >
      <slot />
    </tab-group-title>
  </b-nav-item>
</template>
