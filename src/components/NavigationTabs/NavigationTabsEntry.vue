<script setup>
import TabTitle from '@/components/NavigationTabs/TabTitle'

defineProps({
  active: {
    type: Boolean
  },
  icon: {
    type: String
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
</script>

<template>
  <b-nav-item
    class="navigation-tabs-entry"
    :active="active"
    :active-class="activeClass"
    :exact-active-class="exactActiveClass"
    :disabled="disabled"
    :href="href"
    :rel="rel"
    :target="target"
    :to="to"
  >
    <tab-title :icon="icon" :count="count">
      <slot />
    </tab-title>
  </b-nav-item>
</template>
