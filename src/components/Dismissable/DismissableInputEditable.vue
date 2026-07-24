<script setup>

import { BInput } from 'bootstrap-vue-next'

const modelValue = defineModel({ type: String })
defineProps({
  placeholder: { type: String }
})
</script>

<template>
  <div class="dismissable-input-editable">
    <b-input
      v-model="modelValue"
      class="dismissable-input-editable__text bg-transparent border-0 shadow-none p-0 border-top-0 border-start-0 border-end-0 border-bottom rounded-0 w-100"
      :placeholder="placeholder"
    />
    <slot />
  </div>
</template>

<style scoped lang="scss">
:deep(input) {
  font: inherit;
  color: inherit;
  text-align: inherit;

  &::placeholder {
    font-style: italic;
  }
}
</style>
