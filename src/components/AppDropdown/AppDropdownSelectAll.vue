<script setup>
defineOptions({ name: 'AppDropdownSelectAll' })

const modelValue = defineModel({ type: Boolean, default: false })

defineProps({
  /**
   * Label shown next to the checkbox.
   */
  label: {
    type: String,
    default: null
  }
})
</script>

<template>
  <li class="app-dropdown-select-all">
    <b-form-checkbox v-model="modelValue">
      {{ label }}
    </b-form-checkbox>
  </li>
</template>

<style lang="scss" scoped>
.app-dropdown-select-all {
  display: flex;

  &:deep(.form-check) {
    flex: 1;
    border-radius: var(--bs-border-radius);
    padding-block: $spacer-xs;

    &:hover {
      background: var(--bs-dropdown-link-hover-bg);
      color: var(--bs-dropdown-link-hover-color);
    }
  }
}
</style>
