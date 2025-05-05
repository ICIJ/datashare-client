<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'DocumentUserCommentsListNewest' })
const { t } = useI18n()
</script>

<template>
  <button-icon :label="t('documentUserCommentsListNewest.label')" :icon-left="PhCaretDown" variant="link" />
</template>
