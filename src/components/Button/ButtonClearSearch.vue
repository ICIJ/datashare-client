<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhEraser from '~icons/ph/eraser'

const { t } = useI18n()
</script>

<template>
  <button-icon
    class="button-clear-search"
    variant="outline-light"
    :label="t('buttonClearSearch.label')"
    :icon-left="IPhEraser"
  />
</template>
