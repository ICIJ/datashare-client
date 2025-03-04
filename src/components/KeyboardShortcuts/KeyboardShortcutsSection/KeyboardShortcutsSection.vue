<script setup>
import KeyboardShortcutsSectionTitle from './KeyboardShortcutsSectionTitle'

defineProps({
  title: {
    type: String
  }
})
</script>

<template>
  <div class="keyboard-shortcuts-section">
    <keyboard-shortcuts-section-title :title="title">
      <slot name="title" />
    </keyboard-shortcuts-section-title>
    <slot />
  </div>
</template>
