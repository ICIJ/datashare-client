<script setup>
import { AppIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="search-breadcrumb-form-empty fw-medium text-action-emphasis">
    <app-icon><i-ph-path /></app-icon>
    {{ t('searchBreadcrumbFormEmpty.label') }}
  </div>
</template>
