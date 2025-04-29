<script setup>
import RowPagination from '@/components/RowPagination/RowPagination'
</script>

<template>
  <row-pagination
    keypath-row-range="rowPaginationSearches.rowRange"
    keypath-row-range-compact="rowPaginationSearches.rowRangeCompact"
    keypath-row-range-fewer="rowPaginationSearches.rowRangeFewer"
  />
</template>
