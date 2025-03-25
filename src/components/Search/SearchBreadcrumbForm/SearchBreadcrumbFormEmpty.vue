<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
</script>

<template>
  <div class="search-breadcrumb-form-empty fw-medium text-action-emphasis">
    <phosphor-icon :name="Path" />
    {{ $t('searchBreadcrumbFormEmpty.label') }}
  </div>
</template>
