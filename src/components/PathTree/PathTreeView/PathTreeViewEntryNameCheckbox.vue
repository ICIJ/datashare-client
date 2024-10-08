<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  disabled: {
    type: Boolean
  },
  indeterminate: {
    type: Boolean
  },
  id: {
    type: String
  }
})
</script>

<template>
  <div class="path-tree-view-entry-name-checkbox px-1">
    <b-form-checkbox
      :id="id"
      :disabled="disabled"
      :model-value="modelValue"
      :indeterminate="indeterminate"
      @update:modelValue="$emit('update:modelValue', $event)"
      @update:indeterminate="$emit('update:indeterminate', $event)"
    />
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-entry-name-checkbox {
  &:deep(.form-check-input:checked) {
    border-color: currentColor;
  }
}
</style>
