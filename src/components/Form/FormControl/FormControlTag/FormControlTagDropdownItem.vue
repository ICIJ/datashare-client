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
  <b-dropdown-item :active="active">
    <slot v-bind="{ active, value, item }">
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
