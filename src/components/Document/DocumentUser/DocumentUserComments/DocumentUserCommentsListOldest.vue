<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'DocumentUserCommentsListOldest' })
const { t } = useI18n()
</script>

<template>
  <button-icon :label="t('documentUserCommentsListOldest.label')" :icon-left="PhCaretUp" variant="link" />
</template>
