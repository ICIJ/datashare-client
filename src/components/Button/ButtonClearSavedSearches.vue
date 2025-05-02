<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'

const { t } = useI18n()
</script>

<template>
  <button-icon
    class="button-clear-saved-searches"
    variant="outline-primary"
    :label="t('buttonClearSavedSearches.label')"
    :icon-left="PhTrash"
  />
</template>
