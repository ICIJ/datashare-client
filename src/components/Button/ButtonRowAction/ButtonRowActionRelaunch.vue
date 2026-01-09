<script setup>
import { useI18n } from 'vue-i18n'

import IPhArrowClockwise from '~icons/ph/arrow-clockwise'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'

const { t } = useI18n()
</script>

<template>
  <button-row-action
    :icon="IPhArrowClockwise"
    :label="t('buttonRowAction.relaunch')"
  />
</template>
