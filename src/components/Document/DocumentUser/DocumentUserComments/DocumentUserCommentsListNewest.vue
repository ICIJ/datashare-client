<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhCaretDown from '~icons/ph/caret-down'

defineOptions({ name: 'DocumentUserCommentsListNewest' })
const { t } = useI18n()
</script>

<template>
  <button-icon
    :label="t('documentUserCommentsListNewest.label')"
    :icon-left="IPhCaretDown"
    variant="link"
  />
</template>
