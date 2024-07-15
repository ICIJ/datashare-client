<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { computed, useSlots } from 'vue'

import SearchBreadcrumbToggler from './SearchBreadcrumbToggler'
import SearchBreadcrumbEmpty from './SearchBreadcrumbEmpty'
import SearchBreadcrumbFooter from './SearchBreadcrumbFooter'

const emit = defineEmits(['close'])
const slots = useSlots()
const isEmpty = computed(() => !slots.default)
</script>

<template>
  <div class="search-breadcrumb p-3">
    <template v-if="isEmpty">
      <div class="d-flex align-items-center">
        <search-breadcrumb-toggler class="order-1 align-self-start" @click="emit('close')" />
        <search-breadcrumb-empty class="flex-grow-1 me-3" />
      </div>
    </template>
    <template v-else>
      <div class="d-flex mb-3">
        <search-breadcrumb-toggler class="order-1 align-self-start" @click="emit('close')" />
        <div class="flex-grow-1 d-md-flex">
          <div class="fw-medium text-primary-emphasis text-nowrap me-2 mb-2">
            <phosphor-icon name="path" />
            {{ $t('searchBreadcrumb.label') }}
          </div>
          <div class="search-breadcrumb__entries">
            <slot />
          </div>
        </div>
      </div>
      <search-breadcrumb-footer />
    </template>
  </div>
</template>

<style scoped lang="scss">
.search-breadcrumb {
  color: var(--bs-light-color-subtle);
  background: var(--bs-light-bg-subtle);
  border-radius: var(--bs-border-radius);

  &__entries:deep(.search-breadcrumb-entry:last-of-type .search-breadcrumb-entry__caret) {
    display: none;
  }
}
</style>
