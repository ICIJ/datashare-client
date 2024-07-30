<script setup>
defineProps({
  active: {
    type: Boolean
  },
  option: {
    type: [Number, String, Object]
  },
  value: {
    type: String
  }
})
</script>

<template>
  <b-dropdown-item :active="active">
    <slot v-bind="{ active, value, option }">{{ value }}</slot>
  </b-dropdown-item>
</template>
