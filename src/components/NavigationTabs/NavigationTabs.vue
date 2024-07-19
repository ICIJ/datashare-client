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
    type: String,
    default: 'ul'
  },
  vertical: {
    type: Boolean
  },
  nowrap: {
    type: Boolean
  },
  flush: {
    type: Boolean
  }
})

const classList = computed(() => {
  return {
    'navigation-tabs--nowrap': props.nowrap,
    'navigation-tabs--flush': props.flush
  }
})
</script>

<template>
  <b-nav
    tabs
    underline
    class="navigation-tabs"
    :class="classList"
    :card-header="cardHeader"
    :fill="fill"
    :justified="justified"
    :small="small"
    :tag="tag"
    :vertical="vertical"
  >
    <slot />
  </b-nav>
</template>

<style lang="scss" scoped>
.navigation-tabs {
  &--nowrap:not(.flex-column) {
    overflow: auto;
    flex-wrap: nowrap;
    padding-bottom: $spacer-xxs;
    white-space: nowrap;
  }

  &--flush {
    &:deep(.navigation-tabs-entry:first-of-type a) {
      padding-left: 0;
    }

    &:deep(.navigation-tabs-entry:last-of-type a) {
      padding-right: 0;
    }
  }
}
</style>
