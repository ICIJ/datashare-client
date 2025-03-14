<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
</script>

<template>
  <button-icon
    truncate
    variant="outline-action"
    class="keyboard-shortcuts-popover-link"
    :icon-right="PhCaretRight"
    :to="{ name: 'shortcuts' }"
    icon-right-variant="secondary"
  >
    {{ $t('keyboardShortcutsPopoverLink.label') }}
  </button-icon>
</template>
