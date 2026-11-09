<script setup>
import { computed, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import bodybuilder from 'bodybuilder'

import { apiInstance as api } from '@/api/apiInstance'
import Document from '@/api/resources/Document'
import DocumentViewerArchiveFolder from '@/components/Document/DocumentViewer/DocumentViewerArchiveFolder'
import PathTreeView from '@/components/PathTree/PathTreeView/PathTreeView'
import { toArchiveTree } from '@/utils/archiveTree'

const MAX_DOCUMENTS = 10000
const SOURCE_FIELDS = [
  'title',
  'path',
  'contentType',
  'contentLength',
  'extractionLevel',
  'metadata.tika_metadata_resourcename',
  'metadata.tika_metadata_pst_folderpath'
]

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()

const documents = shallowRef([])
const total = ref(0)
const isLoading = ref(false)
const hasError = ref(false)
const openPaths = ref([])

const documentKey = computed(() => `${props.document.index}/${props.document.id}`)
const tree = computed(() => toArchiveTree(documents.value))
const isEmpty = computed(() => !isLoading.value && !hasError.value && total.value === 0)
const isOverLimit = computed(() => total.value > MAX_DOCUMENTS)

function buildBody() {
  return bodybuilder()
    .size(MAX_DOCUMENTS)
    .filter('term', 'type', 'Document')
    .filter('term', 'parentDocument', props.document.id)
    .sort('title', 'asc')
    .rawOption('track_total_hits', true)
    .build()
}

function toggle(path) {
  if (openPaths.value.includes(path)) {
    openPaths.value = openPaths.value.filter(openPath => openPath !== path)
  }
  else {
    openPaths.value = [...openPaths.value, path]
  }
}

async function load() {
  const key = documentKey.value
  documents.value = []
  total.value = 0
  hasError.value = false
  isLoading.value = true
  try {
    const response = await api.elasticsearch.search({
      index: props.document.index,
      routing: props.document.routing,
      body: buildBody(),
      _source: SOURCE_FIELDS
    })
    if (key !== documentKey.value) {
      return
    }
    documents.value = response.hits.hits.map(hit => Document.create(hit))
    total.value = response.hits.total.value
    openPaths.value = tree.value.folders.map(folder => folder.path)
  }
  catch (error) {
    console.error('Failed to load the content of the archive:', error)
    if (key === documentKey.value) {
      hasError.value = true
    }
  }
  finally {
    if (key === documentKey.value) {
      isLoading.value = false
    }
  }
}

watch(documentKey, load, { immediate: true })
</script>

<template>
  <div class="document-viewer-archive p-3">
    <div
      v-if="hasError"
      class="text-center"
    >
      {{ t('documentViewerArchive.error') }}
    </div>
    <div
      v-else-if="isEmpty"
      class="text-center"
    >
      {{ t('documentViewerArchive.empty') }}
    </div>
    <template v-else>
      <p
        v-if="isOverLimit"
        class="text-muted"
      >
        {{ t('documentViewerArchive.limit', { n: MAX_DOCUMENTS, total }) }}
      </p>
      <path-tree-view
        no-label
        no-search
        :is-loading="isLoading"
      >
        <document-viewer-archive-folder
          :key="documentKey"
          :folder="tree"
          :open-paths="openPaths"
          root
          @toggle="toggle"
        />
      </path-tree-view>
    </template>
  </div>
</template>
