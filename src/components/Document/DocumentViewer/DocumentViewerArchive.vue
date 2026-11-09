<script setup>
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import bodybuilder from 'bodybuilder'

import { apiInstance as api } from '@/api/apiInstance'
import Document from '@/api/resources/Document'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import DocumentViewerArchiveFolder from '@/components/Document/DocumentViewer/DocumentViewerArchiveFolder'
import PathTreeView from '@/components/PathTree/PathTreeView/PathTreeView'
import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
import { ARCHIVE_PAGE_SIZE, findArchiveMatches, toArchiveTree } from '@/utils/archiveTree'
import { findFoldedMatches, foldForFilter } from '@/utils/strings'

const MAX_DOCUMENTS = 10000
const TERM_HIGHLIGHT = 'archive-search-term'
const ACTIVE_TERM_HIGHLIGHT = 'archive-search-term-active'
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
const limits = ref({})
const viewer = useTemplateRef('viewer')

const documentKey = computed(() => `${props.document.index}/${props.document.id}`)
const tree = computed(() => toArchiveTree(documents.value))
const isEmpty = computed(() => !isLoading.value && !hasError.value && total.value === 0)
const isOverLimit = computed(() => total.value > MAX_DOCUMENTS)

function findMatches(term) {
  return findArchiveMatches(tree.value, term).map(match => ({ page: 1, ...match }))
}

const { term, activeIndex, appliedTerm, matches, occurrences, isLoading: isSearching, refresh } = useDocumentLocalSearch({ findMatches })

const activeMatch = computed(() => matches.value[activeIndex.value - 1] ?? null)
const activeKey = computed(() => (activeMatch.value ? toEntryKey(activeMatch.value) : null))

function toEntryKey({ type, path, id }) {
  return type === 'folder' ? `folder:${path}` : `document:${id}`
}

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

function showMore(path) {
  const limit = limits.value[path] ?? ARCHIVE_PAGE_SIZE
  limits.value = { ...limits.value, [path]: limit + ARCHIVE_PAGE_SIZE }
}

function openFolders(paths) {
  const closedPaths = paths.filter(path => !openPaths.value.includes(path))
  if (closedPaths.length) {
    openPaths.value = [...openPaths.value, ...closedPaths]
  }
}

function showDocumentPage({ folderPath, index }) {
  const limit = limits.value[folderPath] ?? ARCHIVE_PAGE_SIZE
  if (index >= limit) {
    const pages = Math.floor(index / ARCHIVE_PAGE_SIZE) + 1
    limits.value = { ...limits.value, [folderPath]: pages * ARCHIVE_PAGE_SIZE }
  }
}

function findEntryElement(key) {
  const elements = viewer.value?.querySelectorAll('[data-archive-entry]') ?? []
  return [...elements].find(element => element.dataset.archiveEntry === key)
}

async function revealMatch(match) {
  if (!match) {
    return
  }
  openFolders(match.ancestors)
  if (match.type === 'document') {
    showDocumentPage(match)
  }
  await nextTick()
  findEntryElement(toEntryKey(match))?.scrollIntoView?.({ block: 'center', behavior: 'instant' })
}

function rangesOf(label, foldedTerm) {
  const text = label.firstChild
  if (!text) {
    return []
  }
  return findFoldedMatches(text.data, foldedTerm).map(({ start, end }) => {
    const range = new Range()
    range.setStart(text, start)
    range.setEnd(text, end)
    return range
  })
}

function paintTerms() {
  const highlights = globalThis.CSS?.highlights
  if (!highlights) {
    return
  }
  const foldedTerm = foldForFilter(appliedTerm.value)
  const ranges = []
  const activeRanges = []
  const labels = foldedTerm ? viewer.value?.querySelectorAll('[data-entry-name]') ?? [] : []
  for (const label of labels) {
    const isActive = label.closest('[data-archive-entry]')?.dataset.archiveEntry === activeKey.value
    const target = isActive ? activeRanges : ranges
    target.push(...rangesOf(label, foldedTerm))
  }
  highlights.set(TERM_HIGHLIGHT, new Highlight(...ranges))
  highlights.set(ACTIVE_TERM_HIGHLIGHT, new Highlight(...activeRanges))
}

function clearTerms() {
  globalThis.CSS?.highlights?.delete(TERM_HIGHLIGHT)
  globalThis.CSS?.highlights?.delete(ACTIVE_TERM_HIGHLIGHT)
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
    limits.value = {}
    refresh()
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
watch(activeMatch, revealMatch)
watch([appliedTerm, activeKey, openPaths, limits, tree], paintTerms, { flush: 'post' })
onBeforeUnmount(clearTerms)
</script>

<template>
  <div
    ref="viewer"
    class="document-viewer-archive"
  >
    <document-toolbox
      v-model="term"
      v-model:active-index="activeIndex"
      :document="document"
      :occurrences="occurrences"
      :loading="isSearching"
      :disabled="!documents.length"
      no-count
    />
    <div
      v-if="hasError"
      class="text-center py-3"
    >
      {{ t('documentViewerArchive.error') }}
    </div>
    <div
      v-else-if="isEmpty"
      class="text-center py-3"
    >
      {{ t('documentViewerArchive.empty') }}
    </div>
    <div
      v-else
      class="py-3"
    >
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
          :limits="limits"
          :active-key="activeKey"
          root
          @toggle="toggle"
          @more="showMore"
        />
      </path-tree-view>
    </div>
  </div>
</template>

<style lang="scss">
::highlight(archive-search-term) {
  background-color: $mark-bg;
  color: black;
}

::highlight(archive-search-term-active) {
  background-color: #38d878;
  color: black;
}
</style>
