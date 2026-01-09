<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'
import IPhArrowLineRight from '~icons/ph/arrow-line-right'
const { t } = useI18n()
</script>

<template>
  <button-icon
    square
    pill
    hide-label
    :icon-left="IPhArrowLineRight"
    icon-left-hover-weight="bold"
    :label="t('separatorLine.expand')"
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
