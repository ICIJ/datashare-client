<template>
  <span class="linked-document-list-entry d-inline-flex align-items-center pe-2"
    ><component :is="findContentTypeIcon(contentType)" class="tertiary me-2" /><router-link
      :to="{ path: url }"
      class="linked-document-list-entry__link d-inline-block text-nowrap"
      ><slot>{{ name }}</slot></router-link
    ></span
  >
</template>

<script setup>
import { findContentTypeIcon } from '@/utils/phosphor-icon-files'

defineOptions({
  name: 'LinkedDocumentListEntry'
})
defineProps({
  contentType: { type: String, default: 'file' },
  url: { type: String, required: true },
  name: { type: String, default: 'No name provided' }
})
</script>
<style lang="scss" scoped></style>
