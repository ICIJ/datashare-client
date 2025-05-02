<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

const { t } = useI18n()
</script>

<template>
  <button-icon
    class="button-clear-search"
    variant="outline-light"
    :label="t('buttonClearSearch.label')"
    :icon-left="PhEraser"
  />
</template>
