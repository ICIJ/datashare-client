<script setup>
import TabGroupTitle from '@/components/TabGroup/TabGroupTitle'

defineProps({
  icon: {
    type: [String, Object, Array]
  },
  count: {
    type: Number,
    default: null
  },
  active: {
    type: Boolean
  },
  lazy: {
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
    class="tab-group-entry"
    :active="active"
    :lazy="lazy"
    :disabled="disabled"
    title-item-class="tab-group-navigation-entry"
    :title-link-attrs="titleLinkAttrs"
    :title-link-class="titleLinkClass"
    ><template #title>
      <tab-group-title :icon="icon" :count="count"
        ><slot name="title">{{ title }}</slot></tab-group-title
      ></template
    >
    <slot />
  </b-tab>
</template>
