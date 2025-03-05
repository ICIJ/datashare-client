<script setup>
defineProps({
  collapse: {
    type: Boolean
  }
})
</script>

<template>
  <b-collapse :model-value="!collapse">
    <div class="form-step-content rounded-4">
      <slot />
    </div>
  </b-collapse>
</template>

<style lang="scss" scoped>
.form-step-content {
  background-color: var(--bs-body-bg);
  padding: $spacer;
  margin-top: $spacer;
}
</style>
