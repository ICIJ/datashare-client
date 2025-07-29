<script setup>
defineProps({
  mention: {
    type: String
  },
  excerpt: {
    type: String
  }
})
</script>

<template>
  <p
    class="entity-popover-mention-excerpt text-center m-0"
    v-html="excerpt"
  />
</template>

<style lang="scss">
.entity-popover-mention-excerpt {
  mark {
    font-weight: $font-weight-bold;
    padding: 0;
  }
}
</style>
