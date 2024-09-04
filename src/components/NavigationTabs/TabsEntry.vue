<script setup>
import TabTitle from '@/components/NavigationTabs/TabTitle'

defineProps({
  icon: {
    type: String
  },
  count: {
    type: Number,
    default: null
  },
  active: {
    type: Boolean
  },
  disabled: {
    type: Boolean
  },
  title: {
    type: String
  },
  titleItemClass: {
    type: String
  },
  titleLinkAttrs: {
    type: String
  },
  titleLinkClass: {
    type: String
  }
})
</script>

<template>
  <b-tab
    class="tabs-entry"
    :active="active"
    :disabled="disabled"
    :title-item-class="titleItemClass"
    :title-link-attrs="titleLinkAttrs"
    :title-link-class="titleLinkClass"
    ><template #title>
      <tab-title :icon="icon" :count="count"
        ><slot name="title">{{ title }}</slot></tab-title
      ></template
    >
    <slot />
  </b-tab>
</template>

<style lang="scss"></style>
