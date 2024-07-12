<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
</script>

<template>
  <div class="search-breadcrumb-empty fw-medium text-primary-emphasis">
    <phosphor-icon name="path" />
    {{ $t('searchBreadcrumbEmpty.label') }}
  </div>
</template>
