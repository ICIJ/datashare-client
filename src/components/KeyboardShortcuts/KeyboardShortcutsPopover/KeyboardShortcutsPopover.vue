<script setup>
import KeyboardShortcutsPopoverLink from './KeyboardShortcutsPopoverLink'
import KeyboardShortcutsPopoverTitle from './KeyboardShortcutsPopoverTitle'

defineProps({
  target: {
    type: [String, Object],
    required: true
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
  </b-popover>
</template>

<style lang="scss">
.keyboard-shortcuts-popover {
  --bs-popover-max-width: 560px;
  --bs-popover-body-padding-y: #{$spacer-lg};
  --bs-popover-body-padding-x: #{$spacer-lg};

  width: 100%;

  .popover-body {
    max-height: 100vh;
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
