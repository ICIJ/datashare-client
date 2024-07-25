<template>
  <ul class="linked-document-list list-unstyled" :style="style">
    <li v-for="document in documents" :key="document.id">
      <linked-document-list-entry :content-type="document.contentType" :url="document.url" :name="document.name" />
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
  overflow-y: scroll;
}
</style>
