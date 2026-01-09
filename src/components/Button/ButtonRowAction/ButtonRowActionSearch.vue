<script setup>
import { useI18n } from 'vue-i18n'

import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'

const { t } = useI18n()
</script>

<template>
  <button-row-action
    :icon="IPhMagnifyingGlass"
    :label="t('buttonRowAction.search')"
  />
</template>
