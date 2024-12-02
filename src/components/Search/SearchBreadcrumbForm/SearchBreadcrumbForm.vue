<script setup>
import { PhosphorIcon } from '@icij/murmur-next'
import { computed, useSlots } from 'vue'

import SearchBreadcrumbFormToggler from './SearchBreadcrumbFormToggler'
import SearchBreadcrumbFormEmpty from './SearchBreadcrumbFormEmpty'
import SearchBreadcrumbFormFooter from './SearchBreadcrumbFormFooter'

const visible = defineModel('visible', { type: Boolean })
const slots = useSlots()
const isEmpty = computed(() => !slots.default)

defineProps({
  hideClearFilters: {
    type: Boolean
  },
  hideClearQuery: {
    type: Boolean
  },
  hideClearFiltersAndQuery: {
    type: Boolean
  },
  hideSaveSearch: {
    type: Boolean
  },
  hideCreateAlert: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['clear:filters', 'clear:query', 'clear:all', 'save:search', 'create:alert'])
</script>

<template>
  <b-collapse v-model="visible" class="search-breadcrumb-form p-3">
    <template v-if="isEmpty">
      <div class="d-flex align-items-center">
        <search-breadcrumb-form-toggler class="order-1 align-self-start" @click="visible = false" />
        <search-breadcrumb-form-empty class="flex-grow-1 me-3" />
      </div>
    </template>
    <template v-else>
      <div class="d-flex mb-3">
        <search-breadcrumb-form-toggler class="order-1 align-self-start" @click="visible = false" />
        <div class="flex-grow-1">
          <div class="fw-medium text-action-emphasis text-nowrap me-2 mb-2">
            <phosphor-icon :name="PhPath" />
            {{ $t('searchBreadcrumbForm.label') }}
          </div>
          <div class="search-breadcrumb-form__entries d-flex flex-wrap row-gap-2 column-gap-1 align-items-baseline">
            <slot />
          </div>
        </div>
      </div>
      <search-breadcrumb-form-footer
        :hide-clear-filters="hideClearFilters"
        :hide-clear-query="hideClearQuery"
        :hide-clear-filters-and-query="hideClearFiltersAndQuery"
        :hide-save-search="hideSaveSearch"
        :hide-create-alert="hideCreateAlert"
        @clear:filters="emit('clear:filters')"
        @clear:query="emit('clear:query')"
        @clear:all="emit('clear:all')"
        @save:search="emit('save:search')"
        @create:alert="emit('create:alert')"
      />
    </template>
  </b-collapse>
</template>

<style lang="scss">
.search-breadcrumb-form {
  color: var(--bs-tertiary-color-subtle);
  background: var(--bs-tertiary-bg-subtle);
  border-radius: var(--bs-border-radius);

  &__entries:deep(.search-breadcrumb-entry:last-of-type .search-breadcrumb-entry__caret) {
    display: none;
  }
}
</style>
