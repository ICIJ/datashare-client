<script setup>
import { useI18n } from 'vue-i18n'

import IPhStopCircle from '~icons/ph/stop-circle'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'

const { t } = useI18n()
</script>

<template>
  <button-row-action
    :icon="IPhStopCircle"
    :label="t('buttonRowAction.stop')"
  />
</template>
