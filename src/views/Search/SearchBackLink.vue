<script setup>

import { useSearchNav } from '@/composables/useSearchNav'
import { useI18n } from 'vue-i18n'
const { searchRoute } = useSearchNav()
const { t } = useI18n()
</script>

<template>
  <router-link :to="searchRoute">
    <span class="d-inline-flex gap-1"><phosphor-icon :name="PhCaretLeft" />{{ t('searchBackLink') }}</span>
  </router-link>
</template>

<style scoped lang="scss">

</style>
