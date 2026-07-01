<script setup>
defineOptions({ name: 'DropdownSelectorSelectAll' })

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
  <li class="dropdown-selector-select-all">
    <b-form-checkbox v-model="modelValue">
      {{ label }}
    </b-form-checkbox>
  </li>
</template>

<style lang="scss" scoped>
.dropdown-selector-select-all {
  display: flex;

  /**
   * Match the checkbox geometry used by item rows so the select-all checkbox
   * lines up horizontally with the options below it, and give the whole row a
   * comfortable, full-width clicking area.
   */
  &:deep(.form-check) {
    flex: 1;
    border-radius: var(--bs-border-radius);
    padding: 0;
    padding-left: 1.5em;
    margin: 0;
    display: flex;
    align-items: center;

    &:hover {
      background: var(--bs-dropdown-link-hover-bg);
      color: var(--bs-dropdown-link-hover-color);
    }

    .form-check-input {
      margin: 0;
      margin-left: -1em;
    }

    .form-check-label {
      padding-left: 0.75em;
      padding-block: $spacer-xs;
      min-height: 1em;
      min-width: 100%;
    }
  }
}
</style>
