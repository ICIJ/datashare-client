<script setup>
defineProps({
  modelValue: {
    type: Boolean
  },
  disabled: {
    type: Boolean
  }
})
</script>

<template>
  <div class="project-dropdown-selector-checkbox">
    <b-form-checkbox
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <slot />
    </b-form-checkbox>
  </div>
</template>

<style lang="scss" scoped>
.project-dropdown-selector-checkbox {
  display: flex;

  /**
   * All those changes to the form-check class are necessary to make the checkbox
   * and the label align use a larger clicking area, even if no label is specified.
   */
  &:deep(.form-check) {
    padding: 0;
    padding-left: 1.5em;
    height: 100%;
    display: flex;
    align-items: center;
    margin: 0;

    .form-check-input {
      margin: 0;
      margin-left: -1em;
    }

    .form-check-label {
      padding-left: 0.75em;
      min-height: 1em;
      min-width: 100%;
    }
  }
}
</style>
