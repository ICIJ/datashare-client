<script setup>
import { onBeforeMount, ref, computed } from 'vue'
import bodybuilder from 'bodybuilder'

import LinkedDocumentCard from '@/components/LinkedDocument/LinkedDocumentCard'
import { useDocument } from '@/composables/useDocument'
import { useCore } from '@/composables/useCore.js'
import Document from '@/api/resources/Document.js'

const { document, documentDirname } = useDocument()

const { core } = useCore()
const show = ref(false)
const siblings = ref([])
const children = ref([])
const searchChildrenRoute = computed(() => {
  const index = document.value.index
  const q = `_routing:${document.value.id}`
  const query = { q, index }
  return { name: 'search', query }
})
const pathSeparator = computed(() => core.config.get('pathSeparator', '/'))
const isWindowsPath = computed(() => pathSeparator.value === '\\')
function escapeBackslashes(path) {
  return path.replace(/\\/g, '\\\\')
}
const escapedDirname = computed(() => {
  return isWindowsPath.value ? escapeBackslashes(documentDirname.value) : documentDirname.value
})
const searchSiblingsRoute = computed(() => {
  const index = document.value.index
  const q = `dirname:"${escapedDirname.value}"`
  const query = { q, index }
  return { name: 'search', query }
})
function fromExtractionLevel(extractionLevel, routing) {
  return bodybuilder()
    .query('match', 'type', 'Document')
    .query('match', 'extractionLevel', extractionLevel)
    .query('match', '_routing', routing)
    .rawOption('_source', { includes: ['*'], excludes: ['content'] })
}
function getChildren() {
  return fromExtractionLevel(document.value.extractionLevel + 1, document.value.routing)
}
function getSiblings() {
  return fromExtractionLevel(document.value.extractionLevel, document.value.routing)
}
async function loadChildren() {
  const body = getChildren().build()
  return core.api.elasticsearch.search({ index: document.value.index, body })
}
async function loadSiblings() {
  const body = getSiblings().build()
  return core.api.elasticsearch.search({ index: document.value.index, body })
}
function dtoDocumentEntryResults(response) {
  return response.hits.hits.map((item) => {
    const doc = new Document(item)
    return {
      contentType: doc.contentType,
      id: doc.id,
      index: doc.index,
      routing: doc.routing,
      name: doc.title
    }
  })
}
onBeforeMount(async () => {
  const [responseChildren, responseSiblings] = await Promise.all([loadChildren(), loadSiblings()])
  children.value = dtoDocumentEntryResults(responseChildren)
  siblings.value = dtoDocumentEntryResults(responseSiblings)
})
</script>

<template>
  <linked-document-card
    v-model="show"
    :siblings="siblings"
    :children="children"
    :to-siblings="searchSiblingsRoute"
    :to-children="searchChildrenRoute"
  />
</template>
