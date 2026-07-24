<script setup>
import RowPagination from '@/components/RowPagination/RowPagination'
</script>

<template>
  <row-pagination
    v-bind="$attrs"
    keypath-row-range="rowPaginationUsers.rowRange"
    keypath-row-range-compact="rowPaginationUsers.rowRangeCompact"
    keypath-row-range-fewer="rowPaginationUsers.rowRangeFewer"
  />
</template>
