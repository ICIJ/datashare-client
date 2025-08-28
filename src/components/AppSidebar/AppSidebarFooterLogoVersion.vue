<script setup>
defineProps({
  compact: {
    type: Boolean
  }
})
</script>

<template>
  <div class="app-sidebar-footer-logo-version ext-truncate w-100">
    <slot v-bind="{ compact }" />
  </div>
</template>
