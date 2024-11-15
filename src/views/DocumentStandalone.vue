<script setup>
import DocumentFloating from '@/components/Document/DocumentFloating.vue'
import DocumentView from '@/views/Document/DocumentView/DocumentView'

defineProps({
  id: {
    type: String
  },
  routing: {
    type: String
  },
  index: {
    type: String
  },
  q: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <document-floating class="mx-5 my-3">
    <document-view :id="id" :routing="routing" :index="index" :q="q" />
  </document-floating>
</template>
