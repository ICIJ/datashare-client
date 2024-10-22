<script setup>
import DocumentCardGrid from '@/components/Document/DocumentCard/DocumentCardGrid'

defineProps({
  entries: {
    type: Array
  },
  selectMode: {
    type: Boolean,
    default: false
  },
  properties: {
    type: Array,
    default: () => ['title', 'thumbnail']
  }
})
</script>

<template>
  <div class="document-entries-grid">
    <div class="document-entries-grid__header">
      <slot name="header" />
    </div>
    <div class="document-entries-grid__list row g-3 px-0">
      <div v-for="entry in entries" :key="entry.id" class="col-lg-3 col-md-4 col-sm-6">
        <document-card-grid :document="entry" :select-mode="selectMode" :properties="properties" />
      </div>
    </div>
  </div>
</template>
