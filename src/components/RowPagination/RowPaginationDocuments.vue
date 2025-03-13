<script setup>
import RowPagination from '@/components/RowPagination/RowPagination'
</script>

<template>
  <row-pagination
    keypath-row-range="rowPaginationDocuments.rowRange"
    keypath-row-range-compact="rowPaginationDocuments.rowRangeCompact"
    keypath-row-range-fewer="rowPaginationDocuments.rowRangeFewer"
  />
</template>
