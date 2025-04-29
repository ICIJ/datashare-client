<script setup>
import RowPagination from '@/components/RowPagination/RowPagination'
</script>

<template>
  <row-pagination
    keypath-row-range="rowPaginationBatchDownloads.rowRange"
    keypath-row-range-compact="rowPaginationBatchDownloads.rowRangeCompact"
    keypath-row-range-fewer="rowPaginationBatchDownloads.rowRangeFewer"
  />
</template>
