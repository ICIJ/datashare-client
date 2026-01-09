<script setup>
import { useI18n } from 'vue-i18n'

import IPhCaretDown from '~icons/ph/caret-down'
import IPhCaretUp from '~icons/ph/caret-up'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
const showDetails = defineModel({ type: Boolean, default: false })
const { t } = useI18n()
</script>

<template>
  <button-row-action
    :icon="showDetails ? IPhCaretUp : IPhCaretDown"
    :label="t('pageTable.toggleDetails')"
    @click="showDetails = !showDetails"
  />
</template>

<style scoped lang="scss"></style>
