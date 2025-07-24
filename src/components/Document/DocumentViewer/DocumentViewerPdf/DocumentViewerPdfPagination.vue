<script setup>
const page = defineModel('page', { type: Number, default: 1 })

defineProps({
  numPages: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <tiny-pagination :key="numPages" v-model="page" :per-page="1" :total-rows="numPages" />
</template>
