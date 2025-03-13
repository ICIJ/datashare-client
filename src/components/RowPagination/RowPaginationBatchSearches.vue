<script setup>
import RowPagination from '@/components/RowPagination/RowPagination'
</script>

<template>
  <row-pagination
    keypath-row-range="rowPaginationBatchSearches.rowRange"
    keypath-row-range-compact="rowPaginationBatchSearches.rowRangeCompact"
    keypath-row-range-fewer="rowPaginationBatchSearches.rowRangeFewer"
  />
</template>
