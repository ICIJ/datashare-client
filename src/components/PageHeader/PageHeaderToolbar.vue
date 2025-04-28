<script setup>
import ButtonToggleFilters from '@/components/Button/ButtonToggleFilters'
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import Hook from '@/components/Hook/Hook'
import RowPagination from '@/components/RowPagination/RowPagination'
import PageContainer from '@/components/PageContainer/PageContainer'

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
    type: [Number, String],
    default: 25
  },
  totalRows: {
    type: Number,
    default: 0
  },
  activeFilters: {
    type: Boolean
  },
  sticky: {
    type: Boolean,
    default: false
  }
})

// We need to expose the setPage function to v-slot variables
// and we cannot pass the model directly to the slot
const setPage = (value) => (page.value = value)
</script>

<template>
  <page-container fluid :sticky="sticky" class="page-header-toolbar d-flex justify-content-between flex-wrap gap-3">
    <hook name="page-header-toolbar:before" />
    <slot name="start" />
    <slot name="toggle-filters">
      <button-toggle-filters
        v-if="filterable"
        class="page-header-toolbar__toggle-filters"
        :active="activeFilters"
        @toggle="emit('toggleFilters', $event)"
      />
    </slot>
    <slot name="pagination" v-bind="{ page, setPage, paginable, perPage, totalRows }">
      <div v-if="paginable" class="page-header-toolbar__pagination">
        <row-pagination :key="totalRows" v-model="page" :total-rows="totalRows" :per-page="perPage" />
      </div>
    </slot>
    <slot name="search">
      <form-control-search
        v-if="searchable"
        v-model="searchQuery"
        autofocus
        :placeholder="searchPlaceholder ?? $t('pageHeader.searchPlaceholder')"
        class="page-header-toolbar__search ms-auto"
      />
    </slot>
    <slot name="end" />
    <hook name="page-header-toolbar:after" />
  </page-container>
</template>

<style scoped lang="scss">
.page-header-toolbar {
  padding-block: $spacer;
  background: var(--bs-body-bg);
  max-width: 100vw;
  overflow: auto;

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
