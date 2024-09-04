<script setup>
import TabGroupTitle from '@/components/TabGroup/TabGroupTitle'

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
    class="tab-group-navigation-entry"
    :active="active"
    :active-class="activeClass"
    :exact-active-class="exactActiveClass"
    :disabled="disabled"
    :href="href"
    :rel="rel"
    :target="target"
    :to="to"
  >
    <tab-group-title :icon="icon" :count="count">
      <slot />
    </tab-group-title>
  </b-nav-item>
</template>
