<script setup>
const page = defineModel('page', { type: Number, default: 1 })

defineProps({
  totalRows: {
    type: Number,
    default: 0
  }
})

</script>

<template>
  <tiny-pagination
    :key="totalRows"
    v-model="page"
    :per-page="1"
    :total-rows="totalRows"
  />
</template>
