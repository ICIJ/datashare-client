<script setup>
import { useI18n } from 'vue-i18n'

import IPhPencilSimple from '~icons/ph/pencil-simple'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'

const { t } = useI18n()
</script>

<template>
  <button-row-action
    :icon="IPhPencilSimple"
    :label="t('buttonRowAction.edit')"
  />
</template>
