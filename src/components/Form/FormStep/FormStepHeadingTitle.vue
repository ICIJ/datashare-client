<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: 'h3'
  }
})
</script>

<template>
  <component :is="tag" class="form-step-heading-title text-truncate">
    <slot>{{ title }}</slot>
  </component>
</template>

<style lang="scss" scoped>
.form-step-heading-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}
</style>
