<template>
  <div class="linked-document-list-entry d-flex">
    <div class="col-12 text-truncate">
      <router-link-document :id="id" :index="index" :routing="routing" :title="name">
        <phosphor-icon :name="findContentTypeIcon(contentType)" class="tertiary me-2" />
        {{ name }}
      </router-link-document>
    </div>
  </div>
</template>

<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import { findContentTypeIcon } from '@/utils/iconFiles'
import RouterLinkDocument from '@/components/RouterLink/RouterLinkDocument'

defineOptions({
  name: 'LinkedDocumentListEntry'
})

defineProps({
  contentType: {
    type: String,
    default: 'file'
  },
  id: {
    type: String,
    required: true
  },
  routing: {
    type: String,
    required: true
  },
  index: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'No name provided'
  }
})
</script>
