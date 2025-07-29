<script setup>
defineProps({
  value: {
    type: Array,
    required: true
  },
  separator: {
    type: String,
    default: '<br class="mb-3" />'
  }
})
</script>

<template>
  <div
    class="display-highlights"
    v-html="value.join(separator)"
  />
</template>
