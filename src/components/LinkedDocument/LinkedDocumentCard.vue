<template>
  <div class="linked-document-card bg-tertiary-subtle rounded row gx-0">
    <slot name="siblings" v-bind="{ modelValue, onUpdateModelValue }"> </slot>
    <slot name="children" v-bind="{ modelValue, onUpdateModelValue }"> </slot>
  </div>
</template>

<script setup>
defineOptions({
  name: 'LinkedDocumentCard'
})

const modelValue = defineModel({ type: Boolean, default: false })

function onUpdateModelValue(value) {
  modelValue.value = value
}
</script>
