<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
</script>

<template>
  <button-icon
    square
    pill
    hide-label
    icon-left="arrow-line-left"
    icon-left-hover-weight="bold"
    :label="$t('separatorLine.reduce')"
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
