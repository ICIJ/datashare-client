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
  >
    {{ $t('keyboardShortcutsPopoverLink.label') }}
  </button-icon>
</template>