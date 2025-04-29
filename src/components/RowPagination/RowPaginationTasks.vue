<script setup>
import RowPagination from '@/components/RowPagination/RowPagination'
</script>

<template>
  <row-pagination
    keypath-row-range="rowPaginationTasks.rowRange"
    keypath-row-range-compact="rowPaginationTasks.rowRangeCompact"
    keypath-row-range-fewer="rowPaginationTasks.rowRangeFewer"
  />
</template>
