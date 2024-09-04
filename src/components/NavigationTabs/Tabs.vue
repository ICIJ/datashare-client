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
  contentClass: { type: String }
})

const navClassList = computed(() => {
  return {
    'navigation-tabs': true,
    'navigation-tabs--nowrap': props.nowrap,
    'navigation-tabs--flush': props.flush
  }
})
</script>

<template>
  <b-tabs
    class="tab-group"
    :active-nav-item-class="activeNavItemClass"
    :nav-class="navClassList"
    :nav-item-class="navItemClass"
    :active-tab-class="activeTabClass"
    :content-class="contentClass"
    :card-header="cardHeader"
    :fill="fill"
    :justified="justified"
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
