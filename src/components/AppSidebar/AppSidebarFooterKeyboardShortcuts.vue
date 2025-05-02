<script setup>
import { useI18n } from 'vue-i18n'

import AppSidebarFooterKeyboardShortcutsPopover from '@/components/AppSidebar/AppSidebarFooterKeyboardShortcutsPopover'
import ButtonIcon from '@/components/Button/ButtonIcon'

defineProps({
  compact: {
    type: Boolean
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})
const { t } = useI18n()
</script>

<template>
  <app-sidebar-footer-keyboard-shortcuts-popover :offset="36">
    <template #target>
      <button-icon
        :label="t('appSidebarFooter.keyboardShortcuts')"
        hide-label
        variant="link"
        class="p-0 text-body"
        icon-left="keyboard"
        icon-left-hover-weight="bold"
      />
    </template>
  </app-sidebar-footer-keyboard-shortcuts-popover>
</template>
