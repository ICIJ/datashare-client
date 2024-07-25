<template>
  <span class="d-inline-flex align-items-center"
    ><component :is="findContentTypeIcon(contentType)" class="me-2" /><router-link :to="url"
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
