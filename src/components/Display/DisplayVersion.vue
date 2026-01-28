<script setup>
defineOptions({ name: 'DisplayVersion' })

defineProps({
  value: {
    type: String,
    default: null
  }
})
</script>

<template>
  <span
    v-if="value"
    class="display-version font-monospace"
  >
    {{ value }}
  </span>
  <span
    v-else
    class="display-version display-version--empty"
  >
    -
  </span>
</template>
