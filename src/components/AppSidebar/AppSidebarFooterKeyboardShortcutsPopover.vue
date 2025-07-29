<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import KeyboardShortcutsPopover from '@/components/KeyboardShortcuts/KeyboardShortcutsPopover/KeyboardShortcutsPopover'
import KeyboardShortcutsSectionEntry from '@/components/KeyboardShortcuts/KeyboardShortcutsSection/KeyboardShortcutsSectionEntry'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const { t } = useI18n()
const { routeShortcuts } = useKeyboardShortcuts()
const isVisible = computed(() => !!routeShortcuts.value.length)
</script>

<template>
  <keyboard-shortcuts-popover
    v-if="isVisible"
    :boundary-padding="36"
    click
    close-on-hide
  >
    <slot>
      <keyboard-shortcuts-section-entry
        v-for="(shortcut, i) in routeShortcuts"
        :key="i"
        :keys="shortcut.keys.default"
        :mac-keys="shortcut.keys.mac"
        :label="t(shortcut.label)"
      />
    </slot>
    <template #target="{ show, hide, toggle, visible }">
      <slot
        name="target"
        v-bind="{ show, hide, toggle, visible }"
      />
    </template>
  </keyboard-shortcuts-popover>
</template>
