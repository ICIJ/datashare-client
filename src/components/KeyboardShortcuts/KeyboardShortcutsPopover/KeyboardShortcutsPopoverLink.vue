<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

const { t } = useI18n()
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
    {{ t('keyboardShortcutsPopoverLink.label') }}
  </button-icon>
</template>
