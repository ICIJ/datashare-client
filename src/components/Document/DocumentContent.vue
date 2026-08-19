<script setup>
import { computed, nextTick, onMounted, reactive, ref, toRef, useTemplateRef, watch } from 'vue'
import clamp from 'lodash/clamp'
import entries from 'lodash/entries'
import findLastIndex from 'lodash/findLastIndex'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import iteratee from 'lodash/iteratee'
import minBy from 'lodash/minBy'
import range from 'lodash/range'
import sortBy from 'lodash/sortBy'
import throttle from 'lodash/throttle'
import { useI18n } from 'vue-i18n'
import { PaginationTiny } from '@icij/murmur'

import { addLocalSearchMarksClassByOffsets } from '@/utils/strings'
import { useCompact } from '@/composables/useCompact'
import { useConfig } from '@/composables/useConfig'
import { useMode } from '@/composables/useMode'
import { useStructureArtifact } from '@/composables/useStructureArtifact'
import { useWait } from '@/composables/useWait'
import DocumentAttachments from '@/components/Document/DocumentAttachments'
import DocumentContentDropdown from '@/components/Document/DocumentContentDropdown'
import DocumentContentMarkdown from '@/components/Document/DocumentContentMarkdown'
import DocumentGlobalSearchTerms from '@/components/Document/DocumentGlobalSearchTerms/DocumentGlobalSearchTerms'
import DocumentLocalSearch from '@/components/Document/DocumentLocalSearch/DocumentLocalSearch'
import Hook from '@/components/Hook/Hook'
import { usePipelinesStore, useSearchStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

const props = defineProps({
  document: Object,
  targetLanguage: {
    type: String,
    default: null
  },
  q: {
    type: String,
    default: ''
  },
  pageSize: {
    type: Number,
    default: 1e4
  },
  compactThreshold: {
    type: Number,
    default: 770
  }
})

const config = useConfig()
const { t } = useI18n()
const { isServer } = useMode()

const pipelinesStore = usePipelinesStore()
const searchStore = useSearchStore.inject()
const elementRef = useTemplateRef('element')
const { compact } = useCompact(elementRef, { threshold: toRef(props, 'compactThreshold') })
const { waitFor, isLoading } = useWait()
const { hasMarkdown, pages: markdownPagesCount, fetchManifest } = useStructureArtifact(toRef(props, 'document'))

const preferMarkdown = ref(true)
// An artifact can be listed in the manifest and still hold no markdown at all.
// That only shows once its first page comes back empty, so the toggle is built
// from the manifest and this runtime finding together.
const isMarkdownEmpty = ref(false)
const markdownPage = ref(1)
const markdownMatches = ref([])
// The term the occurrence counts were computed for. The marks a page renders
// have to match what the backend counted, so this only moves when a search
// actually ran, not on every keystroke.
const markdownAppliedTerm = ref('')
// Set at the end of `onMounted`, so the mode watcher can tell a real, later mode
// flip apart from the manifest probe settling `isMarkdownMode` during the mount.
const isMounted = ref(false)

const isTranslation = computed(() => {
  return !!props.targetLanguage && props.targetLanguage !== 'original'
})

const isMarkdownMode = computed(() => {
  return hasMarkdown.value && !isTranslation.value && preferMarkdown.value
})

const activeMarkdownMatch = computed(() => {
  const match = markdownMatches.value[localSearchIndex.value - 1]
  if (match && match.page === markdownPage.value) {
    return match.nth
  }
  return 0
})

const docIndex = computed(() => props.document?.index)
const docId = computed(() => props.document?.id)
const docRouting = computed(() => props.document?.routing)

const contentSlices = reactive({})
const currentContentPage = ref('')
const activeContentSliceOffset = ref(0)
const localSearchIndex = ref(0)
const localSearchIndexes = ref([])
const localSearchOccurrences = ref(0)
const localSearchTerm = ref(props.q)
const rightToLeftLanguages = ['ARABIC', 'HEBREW', 'PERSIAN', 'KURDISH', 'URDU', 'FULAH', 'AZERBAIJANI']
const maxOffsetTranslations = ref({})
const syncedPages = ref([])

const globalSearchTerms = computed(() => searchStore.retrieveContentQueryTerms)

function getPipelineChain(category, ...pipelines) {
  return pipelinesStore.applyPipelineChainByCategory(category, ...pipelines)
}

function addLocalSearchMarks(content, { offset: delta = 0 } = {}) {
  if (!hasLocalSearchTerms.value) {
    return content
  }
  const offsets = localSearchIndexes.value
  const term = localSearchTerm.value
  return addLocalSearchMarksClassByOffsets({ content, term, offsets, delta })
}

const contentPipeline = computed(() => {
  return getPipelineChain('extracted-text', addLocalSearchMarks)
})

const contentPipelineParams = computed(() => ({
  globalSearchTerms: globalSearchTerms.value,
  localSearchIndex: localSearchIndex.value,
  localSearchOccurrences: localSearchOccurrences.value,
  localSearchTerm: localSearchTerm.value
}))

const activeTermOffset = computed(() => {
  return localSearchIndexes.value[localSearchIndex.value - 1]
})

// `indexOf` answers -1 for an offset that starts no page, which the 1-based
// conversion turns into 0: that offset belongs to the first page.
function pageForOffset(offset) {
  const pageIndex = offsets.value.indexOf(offset)
  return pageIndex + 1 || 1
}

const showPagination = computed(() => {
  return nbPages.value > 1 && (isMarkdownMode.value || loadedOnce.value)
})

const hasLocalSearchTerms = computed(() => {
  return localSearchTerm.value && localSearchTerm.value.length > 0
})

// The structure-pages endpoint answers 400 to a blank query.
const markdownSearchTerm = computed(() => localSearchTerm.value?.trim() ?? '')

const isRightToLeft = computed(() => {
  const language = props.targetLanguage ?? get(props.document, 'source.language', null)
  return rightToLeftLanguages.includes(language)
})

const classList = computed(() => {
  return {
    'document-content--paginated': showPagination.value,
    'document-content--rtl': isRightToLeft.value
  }
})

const page = computed({
  get() {
    if (isMarkdownMode.value) {
      return markdownPage.value
    }
    return pageForOffset(activeContentSliceOffset.value)
  },
  set(value) {
    scrollToDocumentStart()
    if (isMarkdownMode.value) {
      markdownPage.value = value
      return
    }
    activeContentSliceOffset.value = offsets.value[value - 1] || 0
  }
})

const hasExtractedContent = computed(() => maxOffset.value > 0)

const maxOffset = computed(() => {
  const key = props.targetLanguage ?? 'original'
  return maxOffsetTranslations.value[key] || 0
})

const nbPages = computed(() => {
  if (isMarkdownMode.value) {
    return markdownPagesCount.value
  }
  if (syncedPages.value?.length) {
    return syncedPages.value.length
  }
  return Math.floor(maxOffset.value / props.pageSize) + 1
})

const offsets = computed(() => {
  return pages.value.map(([start]) => start)
})

const pages = computed(() => {
  if (syncedPages.value?.length) {
    return syncedPages.value
  }
  return range(0, maxOffset.value, props.pageSize).map((start) => {
    const end = Math.min(start + props.pageSize - 1, maxOffset.value)
    return [start, end]
  })
})

const loadedOnce = computed(() => {
  return !isEmpty(maxOffsetTranslations.value) && !isEmpty(contentSlices)
})

watch(toRef(props, 'q'), value => (localSearchTerm.value = value))

watch(localSearchTerm, throttle(retrieveOccurrencesAndUpdateContent, 300))

watch(localSearchIndex, () => updateContent())

watch(toRef(props, 'targetLanguage'), async (value) => {
  await loadMaxOffset(value)
  await activateContentSlice({ offset: 0 })
})

watch(page, async () => {
  if (isMarkdownMode.value) {
    return
  }
  const offset = activeContentSliceOffset.value
  await activateContentSlice({ offset })
})

watch(isMarkdownMode, async (markdown) => {
  await syncPagePosition(markdown)
  // `hasMarkdown` flips during `onMounted`'s manifest probe, so without this gate
  // that flip would duplicate the search the mount is about to issue itself.
  if (isMounted.value && hasLocalSearchTerms.value) {
    await retrieveOccurrencesAndUpdateContent()
  }
})

// The manifest, the page and the matches all describe one document. The mount
// probe cannot cover a host that swaps the prop without remounting, so the
// document identity re-runs it and clears what belonged to the previous one.
watch(docId, async () => {
  preferMarkdown.value = true
  isMarkdownEmpty.value = false
  markdownPage.value = 1
  markdownMatches.value = []
  markdownAppliedTerm.value = ''
  await fetchManifest()
})

watch(contentPipeline, async () => {
  await cookAllContentSlices()
  currentContentPage.value = getContentSlice({ offset: activeContentSliceOffset.value }).cookedContent
})

onMounted(async () => {
  // `finally`, because a mount step rejecting must not leave the flag stuck
  // `false` and suppress every later mode-flip search for this instance.
  try {
    await Promise.all([loadMaxOffset(), fetchManifest()])
    await syncPages()
    if (props.q) {
      await retrieveOccurrencesAndUpdateContent()
    }
    else {
      await activateContentSlice({ offset: 0 })
    }
  }
  finally {
    isMounted.value = true
  }
})

// A single-page artifact whose only page renders to nothing has no markdown
// worth showing, so the tab goes back to plain text. With more pages, a blank
// one (a scanned cover page) says nothing about the rest of the artifact.
function fallbackToTextForEmptyMarkdown() {
  if (markdownPagesCount.value > 1) {
    return
  }
  isMarkdownEmpty.value = true
  preferMarkdown.value = false
}

// Both paginations describe the same physical pages when their counts match,
// so the page number survives the toggle; anything else has no page
// correspondence and goes back to the first page.
async function syncPagePosition(markdown) {
  // A translation forces text mode through its own contract (start at offset
  // 0, handled by the targetLanguage watcher): its offsets describe another
  // language than the one `syncedPages`/`offsets` were computed for, so this
  // function must not touch the page position in that case.
  if (isTranslation.value) {
    return
  }
  const aligned = !!syncedPages.value?.length && syncedPages.value.length === markdownPagesCount.value
  if (markdown) {
    markdownPage.value = aligned ? pageForOffset(activeContentSliceOffset.value) : 1
    return
  }
  // The restored page needs its text slice loaded, and going through
  // `activateContentSlice` also registers this offset as the current
  // activation, so the activation the mode flip triggered for the previous
  // offset cannot clobber it once it resolves.
  const offset = aligned ? offsets.value[markdownPage.value - 1] ?? 0 : 0
  await activateContentSlice({ offset })
}

const loadMaxOffset = waitFor(async function (targetLanguage = props.targetLanguage) {
  const key = targetLanguage ?? 'original'
  const slice = await api.getDocumentSlice(docIndex.value, docId.value, 0, 0, targetLanguage, docRouting.value)
  const offset = slice.maxOffset
  maxOffsetTranslations.value[key] = offset
  return offset
})

const sameTikaVersion = async function () {
  const dsTikaVersion = await api.getVersion().then(iteratee('ds.extractorVersion'))
  const documentTikaVersion = props.document.meta('tika_version')
  return dsTikaVersion === documentTikaVersion
}

const mustSyncPages = async function () {
  // This feature is experimental and heavy, so we only enable it
  // when certain conditions are met. Including:
  //
  // * The document is a PDF
  return props.document.contentType === 'application/pdf'
  // * We are not in SERVER mode (LOCAL or EMBEDDED)
    && !isServer.value
  // * The server has an artifact directory configured
    && !!config.get('artifactDir')
  // * The user is not requesting a translation
    && !isTranslation.value
  // * The Tika version used to extract the document is the same as the one used by the server
    && await sameTikaVersion()
}

const syncPages = waitFor(async function () {
  if (await mustSyncPages()) {
    syncedPages.value = await api
      .getPages(props.document)
      .then(({ pages }) => pages)
      .catch(() => [])
  }
  else {
    syncedPages.value = []
  }
})

function findContentSliceIndexAround(desiredOffset) {
  return findLastIndex(offsets.value, offset => offset <= desiredOffset)
}

function setContentSlice({
  offset = 0,
  targetLanguage = props.targetLanguage,
  content = '',
  cookedContent = '',
  ...rest
} = {}) {
  const obj = contentSlices
  const targetLanguageKey = targetLanguage || 'original'
  offset = clamp(offset, 0, maxOffset.value)
  if (!obj[offset]) {
    obj[offset] = {}
  }
  obj[offset][targetLanguageKey] = { ...rest, content, cookedContent }
  return { ...rest, content, cookedContent }
}

async function cookContentSlice({ offset = 0, targetLanguage = props.targetLanguage, content = '' } = {}) {
  const cookedContent = await contentPipeline.value(content, { offset, ...contentPipelineParams.value })
  setContentSlice({ offset, targetLanguage, content, cookedContent })
}

async function cookAllContentSlices({ minOffset = 0, maxOffset: maxOffsetParam = maxOffset.value } = {}) {
  for (const [offset, targetLanguages] of entries(contentSlices)) {
    for (const [targetLanguage, contentSlice] of entries(targetLanguages)) {
      if (offset >= minOffset && offset <= maxOffsetParam) {
        await cookContentSlice({ offset, targetLanguage, ...contentSlice })
      }
    }
  }
}

function getContentSlice({ offset = 0, targetLanguage = props.targetLanguage } = {}, defaultValue = null) {
  const targetLanguageKey = targetLanguage || 'original'
  offset = clamp(offset, 0, maxOffset.value)
  return get(contentSlices, [offset, targetLanguageKey], defaultValue)
}

function hasContentSlice({ offset = 0, targetLanguage = props.targetLanguage } = {}) {
  return !!getContentSlice({ offset, targetLanguage })
}

function closestPage({ offset = 0 } = {}) {
  const closestOffsetIndex = minBy(offsets.value, v => Math.abs(v - offset))
  const offsetIndex = offsets.value.indexOf(closestOffsetIndex)
  return pages.value[offsetIndex] || [0, Math.min(props.pageSize - 1, maxOffset.value)]
}

async function loadContentSlice({ offset = 0, targetLanguage = props.targetLanguage } = {}) {
  const [, endOffset] = closestPage({ offset })
  const limit = Math.min(Math.max(endOffset - offset + 1, 0), maxOffset.value - offset)
  const { content } = await api.getDocumentSlice(docIndex.value, docId.value, offset, limit, targetLanguage, docRouting.value)
  return setContentSlice({ offset, targetLanguage, content })
}

async function loadContentSliceOnce({ offset = 0, targetLanguage = props.targetLanguage } = {}) {
  if (!hasContentSlice({ offset, targetLanguage })) {
    await loadContentSlice({ offset, targetLanguage })
  }
  return getContentSlice({ offset, targetLanguage })
}

async function retrieveOccurrencesAndUpdateContent() {
  await retrieveTotalOccurrences()
  await updateContent()
}

async function updateContent() {
  if (isMarkdownMode.value) {
    return updateMarkdownContent()
  }
  await activateContentSliceAround()
  await jumpToActiveLocalSearchTerm()
}

function updateMarkdownContent() {
  const match = markdownMatches.value[localSearchIndex.value - 1]
  if (match) {
    markdownPage.value = match.page
  }
}

let lastOccurrencesRetrieval = 0

async function retrieveTotalOccurrences() {
  // A mode flip mid-flight can start the other path's retrieval before this
  // one's response lands; this counter mirrors `lastContentSliceActivation`
  // so only the newest retrieval is allowed to write its results, whichever
  // response arrives last.
  const retrieval = ++lastOccurrencesRetrieval
  if (isMarkdownMode.value) {
    return retrieveMarkdownOccurrences(retrieval)
  }
  return retrieveTextOccurrences(retrieval)
}

async function retrieveTextOccurrences(retrieval) {
  const { count = 0, offsets = [] } = await fetchTextOccurrences()
  if (retrieval !== lastOccurrencesRetrieval) {
    return
  }
  localSearchIndexes.value = offsets
  localSearchOccurrences.value = count
  localSearchIndex.value = Number(!!count)
}

async function fetchTextOccurrences() {
  if (!hasLocalSearchTerms.value) {
    return {}
  }
  const query = localSearchTerm.value
  const targetLanguage = props.targetLanguage
  try {
    return await api.searchDocument(docIndex.value, docId.value, query, targetLanguage, docRouting.value)
  }
  catch {
    return {}
  }
}

async function retrieveMarkdownOccurrences(retrieval) {
  const { query, matches } = await fetchMarkdownOccurrences()
  if (retrieval !== lastOccurrencesRetrieval) {
    return
  }
  markdownMatches.value = matches
  // The response also carries a `count`, which can exceed the hits it returns
  // when the backend scans only part of the artifact. Counting what we can
  // actually navigate to keeps the counter and the next/previous buttons from
  // disagreeing about how many occurrences there are.
  localSearchOccurrences.value = matches.length
  // Nothing to mark when the backend found nothing; keeping the term empty also
  // keeps a client-side fold from marking what the counter does not know about.
  markdownAppliedTerm.value = matches.length ? query : ''
  localSearchIndex.value = Number(!!matches.length)
}

// The query is captured and handed back so the applied term always describes the
// counts written next to it, even when the user has typed on since.
async function fetchMarkdownOccurrences() {
  const query = markdownSearchTerm.value
  if (!query) {
    return { query, matches: [] }
  }
  try {
    const { hits } = await api.searchStructurePages(docIndex.value, docId.value, query, docRouting.value)
    return { query, matches: flattenPageHits(hits) }
  }
  catch {
    return { query, matches: [] }
  }
}

// One entry per occurrence, sorted by page, so the flat local search index maps
// straight to a page and a 1-based rank within that page. The order is imposed
// here rather than assumed of the response, since next/previous walks this list.
function flattenPageHits(hits) {
  return sortBy(hits ?? [], 'page').flatMap(({ page, count }) => {
    return range(count).map(nth => ({ page, nth: nth + 1 }))
  })
}

async function activateContentSliceAround(desiredOffset = activeTermOffset.value) {
  const { offset } = await loadContentSliceAround(desiredOffset)
  return activateContentSlice({ offset })
}

let lastContentSliceActivation = 0

const activateContentSlice = waitFor(async function ({ offset = 0 } = {}) {
  const activation = ++lastContentSliceActivation
  await loadContentSliceOnce({ offset })
  await cookAllContentSlices()
  // A newer activation was requested while this one was loading: `page` is
  // derived from the active offset and the page watcher activates it back, so
  // writing a superseded offset here makes the two activations overwrite each
  // other forever instead of settling on the offset the user asked for.
  if (activation !== lastContentSliceActivation) {
    return
  }
  activeContentSliceOffset.value = offset
  const { cookedContent = null } = getContentSlice({ offset: activeContentSliceOffset.value }) ?? {}
  currentContentPage.value = cookedContent
})

function clearActiveLocalSearchTerm() {
  const activeTerms = elementRef.value.querySelectorAll('.local-search-term--active')
  activeTerms.forEach(term => term.classList.remove('local-search-term--active'))
}

function scrollToDocumentStart() {
  if (elementRef.value && elementRef.value.getBoundingClientRect().top < 0) {
    elementRef.value.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' })
  }
}

async function jumpToActiveLocalSearchTerm() {
  clearActiveLocalSearchTerm()
  await nextTick()
  const activeTermSelector = `.local-search-term[data-offset="${activeTermOffset.value}"]`
  const activeTerm = elementRef.value.querySelector(activeTermSelector)
  if (activeTerm) {
    activeTerm.classList.add('local-search-term--active')
    activeTerm.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })
  }
  else {
    elementRef.value.scrollTop = 0
  }
}

async function loadContentSliceAround(desiredOffset) {
  const desiredOffsetIndex = findContentSliceIndexAround(desiredOffset)
  const offset = offsets.value[desiredOffsetIndex]
  const slice = await loadContentSliceOnce({ offset })

  return { ...slice, offset }
}
</script>

<template>
  <div
    ref="element"
    class="document-content"
    :class="classList"
  >
    <hook name="document.content:before" />
    <div class="document-content__toolbox d-flex flex-column gap-3">
      <hook name="document.content.toolbox:before" />
      <div class="d-flex flex-md-nowrap flex-wrap align-items-center gap-3">
        <hook name="document.content.toolbox.local-search:before" />
        <document-local-search
          v-model="localSearchTerm"
          v-model:active-index="localSearchIndex"
          :compact="compact"
          :loading="isLoading"
          :occurrences="localSearchOccurrences"
          class="flex-grow-1"
        />
        <hook name="document.content.toolbox.local-search:after" />
        <hook name="document.content.toolbox.before:before" />
        <div
          v-if="showPagination"
          class="document-content__toolbox__pagination"
        >
          <pagination-tiny
            v-model="page"
            :per-page="1"
            :total-rows="nbPages"
            :compact="compact"
          />
        </div>
        <hook name="document.content.toolbox.pagination:after" />
        <document-content-dropdown
          v-if="hasMarkdown"
          v-model="preferMarkdown"
          :markdown-disabled="isMarkdownEmpty"
          :translation="isTranslation"
          class="flex-shrink-0 ms-auto"
        />
      </div>
      <document-global-search-terms
        :document="document"
        :target-language="targetLanguage"
        @select="localSearchTerm = $event"
      />
      <hook name="document.content.toolbox:after" />
    </div>
    <div class="document-content__togglers">
      <hook
        name="document.content.togglers:before"
        x-class="d-flex flex-row justify-content-end align-items-center"
      />
      <hook
        name="document.content.togglers:after"
        x-class="d-flex flex-row justify-content-end align-items-center"
      />
    </div>
    <div class="document-content__wrapper">
      <slot name="before-content" />
      <hook name="document.content.body:before" />
      <document-content-markdown
        v-if="isMarkdownMode"
        class="document-content__body document-content__body--markdown"
        :document="document"
        :page="markdownPage"
        :term="markdownAppliedTerm"
        :global-search-terms="globalSearchTerms"
        :active-match="activeMarkdownMatch"
        @fallback="preferMarkdown = false"
        @empty="fallbackToTextForEmptyMarkdown"
      />
      <div
        v-else-if="hasExtractedContent"
        class="document-content__body"
        v-html="currentContentPage"
      />
      <div
        v-else-if="loadedOnce"
        class="document-content__body document-content__body--no-content text-center p-3"
      >
        {{ t('documentContent.noContent') }}
      </div>
      <hook name="document.content.body:after" />
      <slot name="after-content" />
    </div>
    <document-attachments
      v-show="loadedOnce || isMarkdownMode"
      :document="document"
    />
    <hook name="document.content:after" />
  </div>
</template>

<style lang="scss" scoped>
.document-content {
  &__toolbox {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: $spacer 0;
    background: var(--bs-body-bg);
  }

  &__togglers {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    &:empty {
      display: none;
    }
  }

  &__body {
    word-break: break-all;
  }

  &__body--markdown {
    word-break: normal;
  }

  &--rtl &__body {
    direction: rtl;
  }

  :deep(mark) {
    padding: 0;
  }

  :deep(p) {
    margin-bottom: 0.75rem;
  }

  :deep(.local-search-term) {
    background: $mark-bg;
    color: black;
    padding: 0;
  }

  :deep(.local-search-term--active) {
    background: #38d878;
    color: white;
  }

  :deep(.local-search-term > .global-search-term) {
    background: transparent;
    color: inherit;
    border-bottom: 2px solid transparent;
    padding: 0;
  }
}
</style>
