<script setup>
import SearchFormControl from '@/components/SearchFormControl'

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
  <search-form-control
    :model-value="modelValue"
    :placeholder="placeholder"
    clear-text
    class="filters-panel-search"
    @update:modelValue="emit('update:modelValue', $event)"
  />
</template>
