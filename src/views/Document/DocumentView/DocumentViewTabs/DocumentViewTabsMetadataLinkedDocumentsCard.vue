<script setup>
import { computed, onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhFiles from '~icons/ph/files'
import IPhPaperclip from '~icons/ph/paperclip'

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

const searchStoreChildren = useSearchStore.disposable()
searchStoreChildren.addFilterValue({ name: 'path', value: documentDirname.value })
searchStoreChildren.setQuery(`_routing:${document.value.routing}`)
searchStoreChildren.setIndex(document.value.index)
searchStoreChildren.addFilterValue({ name: 'extractionLevel', value: document.value.extractionLevel + 1 })

const toSiblings = computed(() => ({ name: 'search', query: searchStoreSiblings.toBaseRouteQuery }))
const toChildren = computed(() => ({ name: 'search', query: searchStoreChildren.toBaseRouteQuery }))

function toDocumentEntryResults(hits) {
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
  await searchStoreSiblings.query({}, false)
  await searchStoreChildren.query({}, false)
  siblings.value = toDocumentEntryResults(searchStoreSiblings.hits)
  children.value = toDocumentEntryResults(searchStoreChildren.hits)
})
</script>

<template>
  <linked-document-card>
    <template #siblings="{ modelValue, onUpdateModelValue }">
      <linked-document-section
        :model-value="modelValue"
        header-class="rounded-start"
        :icon="IPhFiles"
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
        :icon="IPhPaperclip"
        :title="t('linkedDocumentCard.children.title', { n: searchStoreChildren.total })"
        :description="t('linkedDocumentCard.children.description')"
        :documents="children"
        :to-search="toChildren"
        @update:model-value="onUpdateModelValue"
      />
    </template>
  </linked-document-card>
</template>
