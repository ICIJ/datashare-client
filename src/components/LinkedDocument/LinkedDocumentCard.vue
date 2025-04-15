<template>
  <div class="linked-document-card bg-tertiary-subtle rounded row gx-0">
    <slot name="siblings" v-bind="{ modelValue: open, onUpdateModelValue }"> </slot>
    <slot name="children" v-bind="{ modelValue: open, onUpdateModelValue }"> </slot>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineOptions({
  name: 'LinkedDocumentCard'
})
const open = ref(false)
function onUpdateModelValue(modelValue) {
  console.log(modelValue)
  open.value = modelValue
}
</script>
