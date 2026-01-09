<script setup>
import { ButtonIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import IPhCaretLeft from '~icons/ph/caret-left'

import { useSearchNav } from '@/composables/useSearchNav'
const { searchRouteWithoutRefresh } = useSearchNav()
const { t } = useI18n()
</script>

<template>
  <button-icon
    :icon-left="IPhCaretLeft"
    :label="t('buttonBackToSearch.label')"
    :to="searchRouteWithoutRefresh"
    variant="link"
  />
</template>
