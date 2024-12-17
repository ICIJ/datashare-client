<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
</script>

<template>
  <button-icon
    truncate
    variant="outline-action"
    class="keyboard-shortcuts-popover-link"
    :icon-right="PhCaretRight"
    icon-right-variant="secondary"
    icon-right-hover-variant="inherit"
    :to="{ name: 'keyboard-shortcuts' }"
  >
    {{ $t('keyboardShortcutsPopoverLink.label') }}
  </button-icon>
</template>

<style lang="scss">
.keyboard-shortcuts-popover-link > .phosphor-icon > svg {
  @include transition(fill 0.15s ease-in-out);
}
</style>
