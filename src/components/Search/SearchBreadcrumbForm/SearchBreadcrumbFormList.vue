<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

defineProps({
  noLabel: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="search-breadcrumb-form-list">
    <div class="fw-medium text-action-emphasis text-nowrap me-2 mb-2" v-if="!noLabel">
      <phosphor-icon :name="PhPath" />
      {{ $t('searchBreadcrumbFormList.label') }}
    </div>
    <div class="search-breadcrumb-form__entries d-flex flex-wrap row-gap-2 column-gap-1 align-items-baseline">
      <slot />
    </div>
  </div>
</template>
