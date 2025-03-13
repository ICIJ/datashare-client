<script setup>
import RowPagination from '@/components/RowPagination/RowPagination'
</script>

<template>
  <row-pagination
    keypath-row-range="rowPaginationProjects.rowRange"
    keypath-row-range-compact="rowPaginationProjects.rowRangeCompact"
    keypath-row-range-fewer="rowPaginationProjects.rowRangeFewer"
  />
</template>
