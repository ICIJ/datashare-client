<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhTrash from '~icons/ph/trash'

const { t } = useI18n()
</script>

<template>
  <button-icon
    class="button-clear-history"
    variant="outline-primary"
    :label="t('buttonClearHistory.label')"
    :icon-left="IPhTrash"
  />
</template>
