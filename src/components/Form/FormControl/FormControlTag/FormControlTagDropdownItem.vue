<script setup>
defineProps({
  active: {
    type: Boolean
  },
  item: {
    type: [Number, String, Object]
  },
  value: {
    type: String
  }
})
</script>

<template>
  <b-dropdown-item
    :active="active"
    class="form-control-tag-dropdown-item"
    :class="{ 'form-control-tag-dropdown-item--active': active }"
  >
    <slot v-bind="{ active, value, item }">
      <!-- pe-none + tabindex="-1": purely decorative; interaction is handled by the parent b-dropdown-item -->
      <b-form-checkbox
        :model-value="active"
        class="pe-none"
        tabindex="-1"
      >
        {{ value }}
      </b-form-checkbox>
    </slot>
  </b-dropdown-item>
</template>

<style lang="scss" scoped>
.form-control-tag-dropdown-item--active {
  // Couples to Bootstrap's .dropdown-item and .form-check-input class names.
  :deep(.dropdown-item:hover .form-check-input) {
    --bs-form-check-bg-image: #{escape-svg($form-check-input-indeterminate-bg-image)};
    background-color: $form-check-input-indeterminate-bg-color;
    border-color: $form-check-input-indeterminate-border-color;
  }
}
</style>
