<script setup>
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

const modelValue = defineModel({ type: String, default: '' })

defineProps({
  placeholder: {
    type: String,
    default: 'Search in filters'
  }
})
</script>

<template>
  <form-control-search v-model="modelValue" :placeholder="placeholder" shadow clear-text class="filters-panel-search" />
</template>
