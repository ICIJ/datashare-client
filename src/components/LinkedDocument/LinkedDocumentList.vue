<template>
  <ul class="linked-document-list list-unstyled pt-1" :style="style">
    <li v-for="{ contentType, index, id, routing, name } in documents" :key="id">
      <linked-document-list-entry :id="id" :content-type="contentType" :routing="routing" :index="index" :name="name" />
    </li>
  </ul>
</template>
<script setup>
import LinkedDocumentListEntry from '@/components/LinkedDocument/LinkedDocumentListEntry'

defineOptions({
  name: 'LinkedDocumentList'
})
const props = defineProps({
  documents: { type: Array, required: true },
  height: { type: String, default: '120px' }
})

const style = {
  '--linked-document-list--height': props.height
}
</script>
<style lang="scss" scoped>
.linked-document-list {
  height: var(--linked-document-list--height);
  overflow-y: auto;
}
</style>
