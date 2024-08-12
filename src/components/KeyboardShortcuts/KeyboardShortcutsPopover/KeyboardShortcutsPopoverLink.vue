<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
</script>

<template>
  <button-icon
    truncate
    variant="outline-action"
    class="keyboard-shortcuts-popover-link"
    icon-right="caret-right"
    icon-right-variant="secondary"
    :to="{ name: 'keyboard-shortcuts' }"
  >
    {{ $t('keyboardShortcutsPopoverLink.label') }}
  </button-icon>
</template>
