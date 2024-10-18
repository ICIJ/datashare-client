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
    <slot v-bind="{ active, value, item }">{{ value }}</slot>
  </b-dropdown-item>
</template>
