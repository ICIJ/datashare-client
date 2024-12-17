<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
</script>

<template>
  <button-icon
    square
    pill
    hide-label
    icon-left="arrow-line-right"
    icon-left-hover-weight="bold"
    label="Expand"
    size="sm"
    variant="outline-dark"
    class="separator-line-expand"
  />
</template>

<style scoped>
.separator-line-expand {
  cursor: e-resize;
}
</style>
