<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import bodybuilder from 'bodybuilder'

import { apiInstance as api } from '@/api/apiInstance'
import Document from '@/api/resources/Document'
import DocumentViewerArchiveFolder from '@/components/Document/DocumentViewer/DocumentViewerArchiveFolder'
import PathTreeView from '@/components/PathTree/PathTreeView/PathTreeView'
import PathTreeViewDocument from '@/components/PathTree/PathTreeView/PathTreeViewDocument'
import { toArchiveTree } from '@/utils/archiveTree'

const MAX_DOCUMENTS = 10000

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()

const documents = ref([])
const total = ref(0)
const isLoading = ref(false)
const hasError = ref(false)
const openPaths = ref([])

const tree = computed(() => toArchiveTree(documents.value))
const isEmpty = computed(() => !isLoading.value && !hasError.value && total.value === 0)
const isOverLimit = computed(() => total.value > MAX_DOCUMENTS)

function buildBody() {
  return bodybuilder()
    .size(MAX_DOCUMENTS)
    .filter('term', 'type', 'Document')
    .filter('term', 'parentDocument', props.document.id)
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
  const { id } = props.document
  documents.value = []
  total.value = 0
  hasError.value = false
  isLoading.value = true
  try {
    const response = await api.elasticsearch.search({
      index: props.document.index,
      routing: props.document.routing,
      body: buildBody(),
      _source_excludes: ['content', 'content_translated']
    })
    if (id !== props.document.id) {
      return
    }
    documents.value = response.hits.hits.map(hit => Document.create(hit))
    total.value = response.hits.total.value
    openPaths.value = tree.value.folders.map(folder => folder.path)
  }
  catch (_) {
    if (id === props.document.id) {
      hasError.value = true
    }
  }
  finally {
    if (id === props.document.id) {
      isLoading.value = false
    }
  }
}

watch(() => props.document.id, load, { immediate: true })
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
        compact
        :is-loading="isLoading"
      >
        <document-viewer-archive-folder
          v-for="folder in tree.folders"
          :key="folder.path"
          :folder="folder"
          :open-paths="openPaths"
          @toggle="toggle"
        />
        <path-tree-view-document
          v-for="rootDocument in tree.documents"
          :key="rootDocument.id"
          :entry="rootDocument"
          compact
        />
      </path-tree-view>
    </template>
  </div>
</template>
