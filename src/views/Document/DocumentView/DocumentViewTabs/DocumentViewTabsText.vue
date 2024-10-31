<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useDocument } from '@/composables/document'
import DocumentNotes from '@/components/Document/DocumentNotes'
import DocumentThread from '@/components/Document/DocumentThread'
import DocumentTranslation from '@/components/Document/DocumentTranslation/DocumentTranslation'

const { document } = useDocument()
const route = useRoute()
const q = computed(() => route.query.q)
</script>

<template>
  <div class="document-view-tabs-text">
    <document-notes :path="document.path" />
    <document-thread v-if="document.isEmail" :document="document" />
    <document-translation v-else :document="document" :q="q" />
  </div>
</template>
