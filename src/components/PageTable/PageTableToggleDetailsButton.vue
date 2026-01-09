<script setup>
import { useI18n } from 'vue-i18n'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
const showDetails = defineModel({ type: Boolean, default: false })
const { t } = useI18n()
</script>

<template>
  <button-row-action
    :icon="showDetails ? PhCaretUp : PhCaretDown"
    :label="t('pageTable.toggleDetails')"
    @click="showDetails = !showDetails"
  />
</template>

<style scoped lang="scss"></style>
