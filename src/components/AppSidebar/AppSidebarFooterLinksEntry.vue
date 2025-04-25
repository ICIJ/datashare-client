<script setup>
import Hook from '@/components/Hook/Hook'

defineProps({
  compact: {
    type: Boolean
  },
  name: {
    type: String
  }
})
</script>

<template>
  <hook name="app-sidebar-footer-links-entry:before" :bind="{ compact, name }" />
  <div class="app-sidebar-footer-links-entry">
    <slot v-bind="{ compact, name }" />
  </div>
  <hook name="app-sidebar-footer-links-entry:after" :bind="{ compact, name }" />
</template>

<style lang="scss" scoped>
.app-sidebar-footer-links-entry {
  display: inline-block;
}
</style>
