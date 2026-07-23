<script setup>
import { PaginationTiny } from '@icij/murmur'

const page = defineModel('page', { type: Number, default: 1 })

defineProps({
  totalRows: {
    type: Number,
    default: 0
  }
})

</script>

<template>
  <pagination-tiny
    :key="totalRows"
    v-model="page"
    :per-page="1"
    :total-rows="totalRows"
  />
</template>
