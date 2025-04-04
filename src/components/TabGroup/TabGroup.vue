<script setup>
import { computed } from 'vue'

const props = defineProps({
  cardHeader: {
    type: Boolean
  },
  fill: {
    type: Boolean
  },
  justified: {
    type: Boolean
  },
  lazy: {
    type: Boolean
  },
  small: {
    type: Boolean
  },
  tag: {
    type: String
  },
  vertical: {
    type: Boolean
  },
  nowrap: {
    type: Boolean
  },
  flush: {
    type: Boolean
  },
  activeNavItemClass: { type: String },
  navItemClass: { type: String },
  activeTabClass: { type: String },
  contentClass: { type: String },
  navClass: { type: String }
})

const navClassList = computed(() => {
  return {
    'nav-underline': true,
    'tab-group-navigation': true,
    'tab-group-navigation--nowrap': props.nowrap,
    'tab-group-navigation--flush': props.flush,
    [props.navClass]: !!props.navClass
  }
})
</script>

<template>
  <b-tabs
    class="tab-group"
    :active-nav-item-class="activeNavItemClass"
    :nav-class="navClassList"
    :active-tab-class="activeTabClass"
    :content-class="contentClass"
    :card-header="cardHeader"
    :fill="fill"
    :justified="justified"
    :lazy="lazy"
    :small="small"
    :tag="tag"
    :vertical="vertical"
  >
    <slot />
  </b-tabs>
</template>

<style lang="scss" scoped>
.tab-group {
  &:deep(.tab-content) {
    padding: $spacer-md 0;
  }
}
</style>
