<script setup>
import { TinyPagination } from '@icij/murmur-next'

import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import ButtonToggleFilters from '@/components/Button/ButtonToggleFilters'

const searchQuery = defineModel('searchQuery', { type: String })
const page = defineModel('page', { type: Number, default: 1 })

const emit = defineEmits(['toggleFilters'])

defineProps({
  filterable: {
    type: Boolean
  },
  searchable: {
    type: Boolean
  },
  searchPlaceholder: {
    type: String,
    default: null
  },
  paginable: {
    type: Boolean
  },
  perPage: {
    type: Number,
    default: 25
  },
  totalRows: {
    type: Number,
    default: 0
  },
  activeFilters: {
    type: Boolean
  },
  pageRow: {
    type: Boolean
  }
})
</script>

<template>
  <div class="page-toolbar d-flex justify-content-between flex-wrap gap-3">
    <slot name="toggle-filters">
      <button-toggle-filters
        v-if="filterable"
        class="page-toolbar__toggle-filters"
        :active="activeFilters"
        @toggle="emit('toggleFilters', $event)"
      />
    </slot>
    <slot name="pagination">
      <div v-if="paginable" class="page-toolbar__pagination">
        <tiny-pagination v-model="page" :row="pageRow" :total-rows="totalRows" :per-page="perPage" />
      </div>
    </slot>
    <slot name="search">
      <form-control-search
        v-if="searchable"
        v-model="searchQuery"
        autofocus
        :placeholder="searchPlaceholder ?? $t('pageHeader.searchPlaceholder')"
        class="page-toolbar__search ms-auto"
      />
    </slot>
    <slot name="end"></slot>
  </div>
</template>

<style scoped lang="scss">
.page-toolbar {
  position: sticky;
  top: 0;
  z-index: $zindex-sticky;
  background: var(--bs-body-bg);

  @include media-breakpoint-down(md) {
    &__pagination {
      order: 1;
      width: 100%;
      flex-grow: 1;
    }

    &__search {
      flex-grow: 1;
    }
  }
}
</style>
