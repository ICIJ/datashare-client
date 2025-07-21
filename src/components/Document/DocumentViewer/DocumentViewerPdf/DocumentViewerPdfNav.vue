<script setup>
import DocumentViewerPdfNavPagination from './DocumentViewerPdfNavPagination'
import DocumentViewerPdfNavDropdown from './DocumentViewerPdfNavDropdown/DocumentViewerPdfNavDropdown'

const page = defineModel('page', { type: Number, default: 1 })
const rotation = defineModel('rotation', { type: Number, default: 0 })
const scale = defineModel('scale', { type: [Number, String], default: 'fit' })

defineProps({
  numPages: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <document-viewer-pdf-nav-pagination v-model="page" :total-rows="numPages" />
  <document-viewer-pdf-nav-dropdown v-model:rotation="rotation" v-model:scale="scale" />
</template>
