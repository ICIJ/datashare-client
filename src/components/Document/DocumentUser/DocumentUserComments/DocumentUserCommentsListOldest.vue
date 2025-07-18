<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

defineOptions({ name: 'DocumentUserCommentsListOldest' })
const { t } = useI18n()
</script>

<template>
  <button-icon :label="t('documentUserCommentsListOldest.label')" :icon-left="PhCaretUp" variant="link" />
</template>
