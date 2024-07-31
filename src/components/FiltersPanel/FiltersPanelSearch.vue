<script setup>
import FormControlSearch from '@/components/FormControl/FormControlSearch'

defineProps({
  modelValue: {
    type: String
  },
  placeholder: {
    type: String,
    default: 'Search in filters'
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <form-control-search
    :model-value="modelValue"
    :placeholder="placeholder"
    clear-text
    class="filters-panel-search"
    @update:modelValue="emit('update:modelValue', $event)"
  />
</template>
