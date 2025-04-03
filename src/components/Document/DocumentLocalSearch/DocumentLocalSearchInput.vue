<script setup>
import { useTemplateRef } from 'vue'

import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'

const modelValue = defineModel({ type: String, default: '' })

defineProps({
  loading: {
    type: Boolean
  }
})

const input = useTemplateRef('input')

defineExpose({
  focus: () => {
    input.value.focus()
  }
})
</script>

<template>
  <form-control-search
    ref="input"
    v-model="modelValue"
    :loading="loading"
    class="document-local-search-input"
    placeholder="Search in document"
    clear-text
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
