<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <div class="search-breadcrumb-form-empty fw-medium text-action-emphasis">
    <phosphor-icon :name="Path" />
    {{ t('searchBreadcrumbFormEmpty.label') }}
  </div>
</template>
