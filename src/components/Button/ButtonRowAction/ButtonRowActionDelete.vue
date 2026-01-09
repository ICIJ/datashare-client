<script setup>
import { useI18n } from 'vue-i18n'

import IPhTrash from '~icons/ph/trash'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'

const { t } = useI18n()
</script>

<template>
  <button-row-action
    :icon="IPhTrash"
    :label="t('buttonRowAction.delete')"
  />
</template>
