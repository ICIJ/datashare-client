<template>
  <header class="linked-document-section-header d-inline-flex gap-2 text-body-emphasis">
    <phosphor-icon :name="icon" />
    <router-link :to="toSearch">
      <slot name="title"> {{ title }} </slot></router-link
    >
  </header>
</template>

<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

defineOptions({
  name: 'LinkedDocumentSection'
})
defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: [String, Object, Array],
    required: true
  },
  toSearch: {
    type: [Object, String]
  }
})
</script>
<style lang="scss" scoped>
.linked-document-section-header {
  font-weight: 500;
  text-wrap: pretty;
}
</style>
