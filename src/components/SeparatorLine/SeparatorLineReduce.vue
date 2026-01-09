<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'
import IPhArrowLineLeft from '~icons/ph/arrow-line-left'
const { t } = useI18n()
</script>

<template>
  <button-icon
    square
    pill
    hide-label
    :icon-left="IPhArrowLineLeft"
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
