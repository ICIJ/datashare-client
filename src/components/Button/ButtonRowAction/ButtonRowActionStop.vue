<script setup>
import { useI18n } from 'vue-i18n'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'

const { t } = useI18n()
</script>

<template>
  <button-row-action :icon="PhStopCircle" :label="t('buttonRowAction.stop')" />
</template>
