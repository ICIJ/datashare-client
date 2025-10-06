<script setup>
import { ButtonIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import { useSearchNav } from '@/composables/useSearchNav'
const { searchRouteWithoutRefresh } = useSearchNav()
const { t } = useI18n()
</script>

<template>
  <button-icon
    :icon-left="PhCaretLeft"
    :label="t('buttonBackToSearch.label')"
    :to="searchRouteWithoutRefresh"
    variant="link"
  />
</template>
