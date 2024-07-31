<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
</script>

<template>
  <button-icon
    square
    pill
    hide-label
    icon-left="hand-grabbing"
    icon-left-hover-weight="bold"
    label="Drag"
    size="sm"
    variant="outline-dark"
    class="separator-line-drag"
  />
</template>

<style scoped>
.separator-line-drag {
  cursor: ew-resize;
}
</style>
