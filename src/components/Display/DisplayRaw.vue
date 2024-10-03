<script setup>
defineProps({
  value: {
    type: [String, Number, Boolean, Date]
  }
})
</script>

<template>
  <span>
    <slot>{{ value }}</slot>
  </span>
</template>
