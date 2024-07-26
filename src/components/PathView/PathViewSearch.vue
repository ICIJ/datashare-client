<script setup>
import SearchFormControl from '@/components/SearchFormControl'

defineProps({
  modelValue: {
    type: String
  }
})
</script>

<template>
  <div class="path-view-search">
    <search-form-control
      class="path-view-search__control"
      :placeholder="$t('pathViewSearch.placeholder')"
      clear-text
      shadow
      :model-value="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
  </div>
</template>
