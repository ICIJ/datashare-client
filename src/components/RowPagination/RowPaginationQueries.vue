<script setup>
import RowPagination from '@/components/RowPagination/RowPagination'
</script>

<template>
  <row-pagination
    keypath-row-range="rowPaginationQueries.rowRange"
    keypath-row-range-compact="rowPaginationQueries.rowRangeCompact"
    keypath-row-range-fewer="rowPaginationQueries.rowRangeFewer"
  />
</template>
