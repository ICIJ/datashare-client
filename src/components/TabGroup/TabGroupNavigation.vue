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
    'tab-group-navigation--nowrap': props.nowrap,
    'tab-group-navigation--flush': props.flush
  }
})
</script>

<template>
  <b-nav
    tabs
    underline
    class="tab-group-navigation"
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
