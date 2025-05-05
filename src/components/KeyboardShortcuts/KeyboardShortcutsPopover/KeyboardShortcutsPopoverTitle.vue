<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <h4 class="keyboard-shortcuts-popover-title d-flex align-items-center text-truncate">
    <phosphor-icon :name="PhKeyboard" class="me-2 flex-shrink-0" />
    {{ t('keyboardShortcutsPopoverTitle.label') }}
  </h4>
</template>

<style lang="scss" scoped>
.keyboard-shortcuts-popover-title {
  font-size: $font-size-base;
  color: var(--bs-action-text-emphasis);
  font-weight: 500;
  line-height: 1.5rem;
  margin: 0;
  padding: 0;
}
</style>
