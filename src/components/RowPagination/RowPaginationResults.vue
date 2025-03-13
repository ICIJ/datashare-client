<script setup>
import RowPagination from '@/components/RowPagination/RowPagination'
</script>

<template>
  <row-pagination
    keypath-row-range="rowPaginationResults.rowRange"
    keypath-row-range-compact="rowPaginationResults.rowRangeCompact"
    keypath-row-range-fewer="rowPaginationResults.rowRangeFewer"
  />
</template>
