<script setup>
import { useDocument } from '@/composables/useDocument'
import DocumentPathBanners from '@/components/Document/DocumentPathBanners'
import DocumentThread from '@/components/Document/DocumentThread/DocumentThread'
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
    <document-path-banners
      :document="document"
      class="mt-3"
    />
    <document-thread
      v-if="document.isEmail"
      :document="document"
      :q="q"
    />
    <document-translation
      v-else
      :document="document"
      :q="q"
    />
  </div>
</template>
