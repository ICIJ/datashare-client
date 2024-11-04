<template>
  <div class="document-standalone mx-5 my-3">
    <document-view :id="id" :routing="routing" :index="index" :q="q" base="document-standalone" />
  </div>
</template>

<script setup>
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
