<script setup>
import { computed, useSlots } from 'vue'

import SearchBreadcrumbFormToggler from './SearchBreadcrumbFormToggler'
import SearchBreadcrumbFormEmpty from './SearchBreadcrumbFormEmpty'
import SearchBreadcrumbFormFooter from './SearchBreadcrumbFormFooter'
import SearchBreadcrumbFormList from './SearchBreadcrumbFormList'

const visible = defineModel('visible', { type: Boolean })
const slots = useSlots()
const isEmpty = computed(() => !slots.default)

defineProps({
  disabledClearFilters: {
    type: Boolean
  },
  disabledClearQuery: {
    type: Boolean
  },
  disabledClearFiltersAndQuery: {
    type: Boolean
  },
  disabledSaveSearch: {
    type: Boolean
  },
  disabledCreateAlert: {
    type: Boolean,
    default: true
  },
  wrapperClass: {
    type: [String, Array, Object]
  }
})

const emit = defineEmits(['clear:filters', 'clear:query', 'clear:all', 'save:search', 'create:alert'])
</script>

<template>
  <b-collapse
    v-model="visible"
    class="search-breadcrumb-form"
  >
    <div
      class="search-breadcrumb-form__wrapper p-3"
      :class="wrapperClass"
    >
      <template v-if="isEmpty">
        <div class="d-flex align-items-center">
          <search-breadcrumb-form-toggler
            class="order-1 align-self-start"
            @click="visible = false"
          />
          <search-breadcrumb-form-empty class="flex-grow-1 me-3" />
        </div>
      </template>
      <template v-else>
        <div class="d-flex mb-3">
          <search-breadcrumb-form-toggler
            class="order-1 align-self-start"
            @click="visible = false"
          />
          <search-breadcrumb-form-list class="flex-grow-1">
            <slot />
          </search-breadcrumb-form-list>
        </div>
        <search-breadcrumb-form-footer
          :disabled-clear-filters="disabledClearFilters"
          :disabled-clear-query="disabledClearQuery"
          :disabled-clear-filters-and-query="disabledClearFiltersAndQuery"
          :disabled-save-search="disabledSaveSearch"
          :disabled-create-alert="disabledCreateAlert"
          @clear:filters="emit('clear:filters')"
          @clear:query="emit('clear:query')"
          @clear:all="emit('clear:all')"
          @save:search="emit('save:search')"
          @create:alert="emit('create:alert')"
        />
      </template>
    </div>
  </b-collapse>
</template>

<style lang="scss">
.search-breadcrumb-form {

  &__wrapper {
    color: var(--bs-tertiary-color-subtle);
    background: var(--bs-tertiary-bg-subtle);
    border-radius: var(--bs-border-radius);

    .search-breadcrumb-form-list__entries:deep(.search-breadcrumb-entry:last-of-type .search-breadcrumb-entry__caret) {
      display: none;
    }
  }
}
</style>
