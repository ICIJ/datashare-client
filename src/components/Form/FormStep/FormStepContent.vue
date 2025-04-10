<script setup>
defineProps({
  collapse: {
    type: Boolean
  },
  contentClass: {
    type: [String, Array, Object]
  }
})
</script>

<template>
  <b-collapse :model-value="!collapse">
    <div class="form-step-content" :class="contentClass">
      <slot />
    </div>
  </b-collapse>
</template>

<style lang="scss" scoped>
.form-step-content {
  background-color: var(--bs-body-bg);
  padding: $spacer;
  margin-top: $spacer;
  border-radius: var(--bs-border-radius-lg);
}
</style>
