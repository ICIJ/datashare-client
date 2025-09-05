<script setup>
defineProps({
  compact: {
    type: Boolean
  }
})
</script>

<template>
  <div class="app-sidebar-footer-logo-version text-truncate">
    <slot v-bind="{ compact }" />
  </div>
</template>
