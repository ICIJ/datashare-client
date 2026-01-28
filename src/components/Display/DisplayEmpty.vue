<script setup>
defineOptions({ name: 'DisplayEmpty' })

defineProps({
  value: {
    type: [String, Number, Boolean, Object, Array],
    default: null
  }
})
</script>

<template>
  <span
    v-if="value"
    class="display-empty"
  >
    <slot>{{ value }}</slot>
  </span>
  <span
    v-else
    class="display-empty display-empty--empty"
  >
    <slot name="empty">-</slot>
  </span>
</template>
