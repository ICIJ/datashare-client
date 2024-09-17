<script setup>
import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

defineProps({
  modelValue: {
    type: String
  }
})
</script>

<template>
  <div class="path-tree-view-search">
    <form-control-search
      class="path-tree-view-search__control"
      :placeholder="$t('pathViewSearch.placeholder')"
      clear-text
      shadow
      :model-value="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
  </div>
</template>
