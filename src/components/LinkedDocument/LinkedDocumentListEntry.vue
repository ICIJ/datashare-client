<template>
  <span class="linked-document-list-entry d-inline-flex align-items-center gap-2"
    ><phosphor-icon :name="findContentTypeIcon(contentType)" class="tertiary" />
    <router-link-document :id="id" :index="index" :routing="routing">{{ name }}</router-link-document>
  </span>
</template>

<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import { findContentTypeIcon } from '@/utils/phosphorIconFiles'
import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'

defineOptions({
  name: 'LinkedDocumentListEntry'
})
defineProps({
  contentType: { type: String, default: 'file' },
  id: { type: String, required: true },
  routing: { type: String, required: true },
  index: { type: String, required: true },
  name: { type: String, default: 'No name provided' }
})
</script>
<style lang="scss" scoped></style>
