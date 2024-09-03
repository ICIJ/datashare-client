<script setup>
import { computed } from 'vue'

const props = defineProps({
  mention: {
    type: String
  },
  excerpt: {
    type: String
  }
})
const replacement = `<span class="entity-popover-mention-excerpt__mark">${props.mention}</span>`
const content = computed(() => {
  return props.excerpt.replace(new RegExp(props.mention, 'g'), replacement)
})
</script>

<template>
  <p class="entity-popover-mention-excerpt text-center m-0" v-html="content" />
</template>

<style lang="scss">
.entity-popover-mention-excerpt {
  &::before,
  &::after {
    content: '...';
  }
  &__mark {
    font-weight: $font-weight-bold;
  }
}
</style>
