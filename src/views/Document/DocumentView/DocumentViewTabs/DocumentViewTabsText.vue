<script setup>
import { useDocument } from '@/composables/useDocument'
import DocumentNotes from '@/components/Document/DocumentNotes'
import DocumentThread from '@/components/Document/DocumentThread'
import DocumentTranslation from '@/components/Document/DocumentTranslation/DocumentTranslation'

defineProps({
  q: {
    type: String,
    default: ''
  }
})

const { document } = useDocument()
</script>

<template>
  <div class="document-view-tabs-text">
    <document-notes :path="document.path" />
    <document-thread v-if="document.isEmail" :document="document" :q="q" />
    <document-translation v-else :document="document" :q="q" />
  </div>
</template>
