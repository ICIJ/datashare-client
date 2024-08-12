<script setup>
import KeyboardShortcutsSectionTitle from '@/components/KeyboardShortcuts/KeyboardShortcutsSection/KeyboardShortcutsSectionTitle'

defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="keyboard-shortcuts-section">
    <keyboard-shortcuts-section-title :title="title" />
    <slot />
  </div>
</template>
