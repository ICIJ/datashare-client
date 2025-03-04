<script setup>
import KeyboardShortcutsPopoverLink from './KeyboardShortcutsPopoverLink'
import KeyboardShortcutsPopoverTitle from './KeyboardShortcutsPopoverTitle'

defineProps({
  target: {
    type: [String, Object]
  },
  placement: {
    type: String,
    default: 'right'
  }
})
</script>

<template>
  <b-popover class="keyboard-shortcuts-popover" :target="target" :placement="placement" teleport-to="body">
    <div
      class="keyboard-shortcuts-popover__header d-flex flex-truncate justify-content-between align-items-center w-100 mb-4"
    >
      <keyboard-shortcuts-popover-title />
      <keyboard-shortcuts-popover-link />
    </div>
    <div class="keyboard-shortcuts-popover__content">
      <slot />
    </div>
    <template #target="{ show, hide, toggle, visible }">
      <slot name="target" v-bind="{ show, hide, toggle, visible }" />
    </template>
  </b-popover>
</template>

<style lang="scss">
.keyboard-shortcuts-popover {
  --bs-popover-max-width: 580px;
  --bs-popover-body-padding-y: #{$spacer-lg};
  --bs-popover-body-padding-x: #{$spacer-lg};

  width: 100%;

  .popover-body {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .keyboard-shortcuts-popover__content {
      overflow-y: auto;
      padding-right: $spacer-xs;
    }
  }
}
</style>
