<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, shallowRef, useTemplateRef, watch } from 'vue'
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
const openPaths = reactive(new Set())
const activeKeys = reactive(new Set())
const limits = ref({})
const viewer = useTemplateRef('viewer')
let paintedRanges = []
let stopScrollAfterExpand = () => {}

const documentKey = computed(() => `${props.document.index}/${props.document.id}`)
const isMailbox = computed(() => props.document.contentType.startsWith('application/mbox'))
const tree = computed(() => toArchiveTree(documents.value, { isMailbox: isMailbox.value }))
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
  if (openPaths.has(path)) {
    openPaths.delete(path)
  }
  else {
    openPaths.add(path)
  }
}

function showMore(path) {
  const limit = limits.value[path] ?? ARCHIVE_PAGE_SIZE
  limits.value = { ...limits.value, [path]: limit + ARCHIVE_PAGE_SIZE }
}

function openFolders(paths) {
  const closedPaths = paths.filter(path => !openPaths.has(path))
  closedPaths.forEach(path => openPaths.add(path))
  return closedPaths.length > 0
}

function resetOpenFolders() {
  openPaths.clear()
  tree.value.folders.forEach(folder => openPaths.add(folder.path))
}

// Each folder reads only its own key, so moving the active match re-renders
// the two folders holding the previous and the next match, not all of them.
function moveActiveKey(key, previousKey) {
  activeKeys.delete(previousKey)
  if (key) {
    activeKeys.add(key)
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

function scrollToMatch(match) {
  findEntryElement(toEntryKey(match))?.scrollIntoView?.({ block: 'center', behavior: 'instant' })
}

// Opened folders grow with a height animation that moves the match while it
// runs, so scroll to it again once the animation ends.
function scrollToMatchAfterExpand(match) {
  const scrollOnExpanded = (event) => {
    if (event.propertyName !== 'height') {
      return
    }
    stopScrollAfterExpand()
    scrollToMatch(match)
  }
  viewer.value?.addEventListener('transitionend', scrollOnExpanded)
  stopScrollAfterExpand = () => viewer.value?.removeEventListener('transitionend', scrollOnExpanded)
}

async function revealMatch(match) {
  stopScrollAfterExpand()
  if (!match) {
    return
  }
  const hasOpenedFolders = openFolders(match.ancestors)
  if (match.type === 'document') {
    showDocumentPage(match)
  }
  await nextTick()
  scrollToMatch(match)
  if (hasOpenedFolders) {
    scrollToMatchAfterExpand(match)
  }
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

// Highlights live in a registry shared by the whole page, so each viewer adds
// and removes only its own ranges to leave those of another viewer intact.
function findOrCreateHighlight(name) {
  const { highlights } = globalThis.CSS
  if (!highlights.has(name)) {
    highlights.set(name, new Highlight())
  }
  return highlights.get(name)
}

function paintRanges(name, ranges) {
  const highlight = findOrCreateHighlight(name)
  for (const range of ranges) {
    highlight.add(range)
    paintedRanges.push({ name, range })
  }
}

function paintTerms() {
  if (!globalThis.CSS?.highlights) {
    return
  }
  clearTerms()
  const foldedTerm = foldForFilter(appliedTerm.value)
  const labels = foldedTerm ? viewer.value?.querySelectorAll('[data-entry-name]') ?? [] : []
  for (const label of labels) {
    const isActive = label.closest('[data-archive-entry]')?.dataset.archiveEntry === activeKey.value
    const name = isActive ? ACTIVE_TERM_HIGHLIGHT : TERM_HIGHLIGHT
    paintRanges(name, rangesOf(label, foldedTerm))
  }
}

function clearTerms() {
  for (const { name, range } of paintedRanges) {
    globalThis.CSS.highlights.get(name)?.delete(range)
  }
  paintedRanges = []
}

async function load() {
  const key = documentKey.value
  documents.value = []
  total.value = 0
  hasError.value = false
  isLoading.value = true
  try {
    const response = await api.elasticsearch._search({
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
    resetOpenFolders()
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
watch(activeKey, moveActiveKey)
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
          :active-keys="activeKeys"
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
