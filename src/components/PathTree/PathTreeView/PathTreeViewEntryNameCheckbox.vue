<script setup>
const modelValue = defineModel({ type: Boolean })
const indeterminate = defineModel('indeterminate', { type: Boolean })

defineProps({
  disabled: {
    type: Boolean
  },
  id: {
    type: String
  }
})
</script>

<template>
  <div class="path-tree-view-entry-name-checkbox px-1">
    <b-form-checkbox :id="id" v-model="modelValue" v-model:indeterminate="indeterminate" :disabled="disabled" />
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-entry-name-checkbox {
  &:deep(.form-check-input:checked) {
    border-color: currentColor;
  }

  /**
   * Temporary fix of the indeterminate state:
   * @see https://github.com/bootstrap-vue-next/bootstrap-vue-next/issues/2271
   */
  &:deep(.form-check-input[indeterminate]) {
    background-color: $form-check-input-indeterminate-bg-color;
    border-color: $form-check-input-indeterminate-border-color;
    --bs-form-check-bg-image: #{escape-svg($form-check-input-indeterminate-bg-image)};
  }
}
</style>
