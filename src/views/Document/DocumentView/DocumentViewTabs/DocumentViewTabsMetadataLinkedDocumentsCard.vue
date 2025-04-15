<script setup>
import { computed, onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import LinkedDocumentCard from '@/components/LinkedDocument/LinkedDocumentCard'
import { useDocument } from '@/composables/useDocument'
import { useSearchStore } from '@/store/modules/search.js'
import LinkedDocumentSection from '@/components/LinkedDocument/LinkedDocumentSection.vue'

const { document, documentDirname } = useDocument()
const { t } = useI18n()
const siblings = ref([])
const children = ref([])

const searchStoreSiblings = useSearchStore.disposable()
searchStoreSiblings.addFilterValue({ name: 'path', value: documentDirname.value })
searchStoreSiblings.setIndex(document.value.index)
searchStoreSiblings.addFilterValue({ name: 'extractionLevel', value: document.value.extractionLevel })
const toSiblings = computed(() => {
  return { name: 'search', query: searchStoreSiblings.toBaseRouteQuery }
})

const searchStoreChildren = useSearchStore.disposable()
searchStoreChildren.addFilterValue({ name: 'path', value: documentDirname.value })
searchStoreChildren.setQuery(`_routing:${document.value.routing}`)
searchStoreChildren.setIndex(document.value.index)
searchStoreChildren.addFilterValue({ name: 'extractionLevel', value: document.value.extractionLevel + 1 })
const toChildren = computed(() => {
  return { name: 'search', query: searchStoreChildren.toBaseRouteQuery }
})

function dtoDocumentEntryResults(hits) {
  return hits.map((item) => {
    return {
      contentType: item.contentType,
      id: item.id,
      index: item.index,
      routing: item.routing,
      name: item.title
    }
  })
}
onBeforeMount(async () => {
  await Promise.all([searchStoreSiblings.query(), searchStoreChildren.query()])
  siblings.value = dtoDocumentEntryResults(searchStoreSiblings.hits)
  children.value = dtoDocumentEntryResults(searchStoreChildren.hits)
})
</script>

<template>
  <linked-document-card>
    <template #siblings="{ modelValue, onUpdateModelValue }">
      <linked-document-section
        :model-value="modelValue"
        header-class="rounded-start"
        icon="files"
        :title="t('linkedDocumentCard.siblings.title', { n: searchStoreSiblings.total })"
        :description="t('linkedDocumentCard.siblings.description')"
        :documents="siblings"
        :to-search="toSiblings"
        @update:model-value="onUpdateModelValue"
      />
    </template>
    <template #children="{ modelValue, onUpdateModelValue }">
      <linked-document-section
        :model-value="modelValue"
        header-class="rounded-end"
        icon="paperclip"
        :title="t('linkedDocumentCard.children.title', { n: searchStoreChildren.total })"
        :description="t('linkedDocumentCard.children.description')"
        :documents="children"
        :to-search="toChildren"
        @update:model-value="onUpdateModelValue"
      />
    </template>
  </linked-document-card>
</template>
