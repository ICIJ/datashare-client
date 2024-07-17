<script setup>
import IconButton from '@/components/IconButton'
</script>

<template>
  <icon-button
    square
    pill
    hide-label
    icon-left="arrow-line-left"
    icon-left-hover-weight="bold"
    label="Reduce"
    size="sm"
    variant="outline-dark"
    class="separator-line-reduce"
  />
</template>

<style scoped>
.separator-line-reduce {
  cursor: w-resize;
}
</style>
