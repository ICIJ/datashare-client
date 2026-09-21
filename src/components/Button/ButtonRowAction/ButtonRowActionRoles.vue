<script setup>
import { useI18n } from 'vue-i18n'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
import IPhGear from '~icons/ph/gear'

const { t } = useI18n()
</script>

<template>
  <button-row-action
    :icon="IPhGear"
    :label="t('buttonRowAction.manageRoles')"
  />
</template>
