<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <h4 class="keyboard-shortcuts-section-title">{{ title }}</h4>
</template>

<style lang="scss" scoped>
.keyboard-shortcuts-section-title {
  font-size: $font-size-lg;
  line-height: 1.5rem;
  font-weight: 700;
  margin-bottom: $spacer;
  padding: 0;
}
</style>
