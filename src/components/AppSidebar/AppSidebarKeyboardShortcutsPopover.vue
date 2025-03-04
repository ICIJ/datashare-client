<script setup>
import { computed } from 'vue'

import KeyboardShortcutsPopover from '@/components/KeyboardShortcuts/KeyboardShortcutsPopover/KeyboardShortcutsPopover'
import KeyboardShortcutsSectionEntry from '@/components/KeyboardShortcuts/KeyboardShortcutsSection/KeyboardShortcutsSectionEntry'

import { useKeyboardShortcuts } from '@/composables/keyboard-shortcuts'

const { routeShortcuts } = useKeyboardShortcuts()
const isVisible = computed(() => !!routeShortcuts.value.length)
</script>

<template>
  <keyboard-shortcuts-popover :boundary-padding="36" click close-on-hide v-if="isVisible">
    <slot>
      <keyboard-shortcuts-section-entry 
        v-for="(shortcut, i) in routeShortcuts" 
        :key="i"
        :keys="shortcut.keys.default" 
        :mac-keys="shortcut.keys.mac" 
        :label="$t(shortcut.label)" 
      />
    </slot>
    <template #target="{ show, hide, toggle, visible }">
      <slot name="target" v-bind="{ show, hide, toggle, visible }" />
    </template>
  </keyboard-shortcuts-popover>
</template>