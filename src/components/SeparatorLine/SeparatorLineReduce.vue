<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'
const { t } = useI18n()
</script>

<template>
  <button-icon
    square
    pill
    hide-label
    icon-left="arrow-line-left"
    icon-left-hover-weight="bold"
    :label="t('separatorLine.reduce')"
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
