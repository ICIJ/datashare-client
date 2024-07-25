<script setup>
import SearchFormControl from '@/components/SearchFormControl'

defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <search-form-control
    class="document-local-search-input"
    placeholder="Search in document"
    clear-text
    :model-value="modelValue"
    @update:modelValue="($event) => $emit('update:modelValue', $event)"
  />
</template>

<style lang="scss">
@include color-mode(light) {
  .document-local-search-input {
    transition: box-shadow 0.2s ease-in-out;
    box-shadow: 1px 1px 8px 5px var(--bs-light);

    &:has(input:focus) {
      box-shadow: 1px 1px 0 0 var(--bs-light);
    }
  }
}
</style>
