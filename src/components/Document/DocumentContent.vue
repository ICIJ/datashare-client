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
import { useI18n } from 'vue-i18n'

import { addLocalSearchMarksClassByOffsets } from '@/utils/strings'
import { useConfig } from '@/composables/useConfig'
import { useDocumentLocalSearch } from '@/composables/useDocumentLocalSearch'
import { useMode } from '@/composables/useMode'
import { useStructureArtifact } from '@/composables/useStructureArtifact'
import { useWait } from '@/composables/useWait'
import DocumentAttachments from '@/components/Document/DocumentAttachments'
import DocumentContentDropdown from '@/components/Document/DocumentContentDropdown'
import DocumentContentMarkdown from '@/components/Document/DocumentContentMarkdown'
import DocumentToolbox from '@/components/Document/DocumentToolbox/DocumentToolbox'
import Hook from '@/components/Hook/Hook'
import { useHooksStore, usePipelinesStore, useSearchStore } from '@/store/modules'
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
const hooksStore = useHooksStore()
const hasContentBodyHook = computed(() => hooksStore.filterComponentsByTarget('document.content.body:before').length > 0)

const pipelinesStore = usePipelinesStore()
const searchStore = useSearchStore.inject()
const elementRef = useTemplateRef('element')
const { waitFor, isLoading } = useWait()
const { hasMarkdown, pages: markdownPagesCount, fetchManifest } = useStructureArtifact(toRef(props, 'document'))

const preferMarkdown = ref(true)
// An artifact can be listed in the manifest and still hold no markdown at all.
// That only shows once its first page comes back empty, so the toggle is built
// from the manifest and this runtime finding together.
const isMarkdownEmpty = ref(false)
// An oversized page already sent the reader to plain text once for this
// document: the dropdown's "Formatted" entry then becomes their explicit
// "render anyway", so the child renders it instead of re-emitting.
const markdownOversized = ref(false)
const markdownPage = ref(1)
// Set at the end of `onMounted`, so the mode watcher can tell a real, later mode
// flip apart from the manifest probe settling `isMarkdownMode` during the mount.
let isMounted = false

const isTranslation = computed(() => {
  return !!props.targetLanguage && props.targetLanguage !== 'original'
})

const isMarkdownMode = computed(() => {
  return hasMarkdown.value && !isTranslation.value && preferMarkdown.value
})

const activeMarkdownMatch = computed(() => {
  const match = localSearchMatches.value[localSearchIndex.value - 1]
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
const {
  term: localSearchTerm,
  activeIndex: localSearchIndex,
  matches: localSearchMatches,
  occurrences: localSearchOccurrences,
  isLoading: isLocalSearchLoading,
  refresh: refreshLocalSearch
} = useDocumentLocalSearch({ findMatches })
const localSearchIndexes = computed(() => localSearchMatches.value.map(({ offset }) => offset))

localSearchTerm.value = props.q

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

// The term the matches were found for, read off the matches themselves so it
// always describes the counts shown next to it, even when the user has typed
// on since. Nothing to mark when the backend found nothing.
const markdownAppliedTerm = computed(() => localSearchMatches.value[0]?.term ?? '')

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

watch(localSearchMatches, () => updateContent())

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
  if (isMounted && hasLocalSearchTerms.value) {
    await refreshLocalSearch()
  }
})

// Consent to render an oversized page is given for that page, not for the
// document: the next page gets the size guard again.
watch(markdownPage, () => {
  markdownOversized.value = false
})

// The manifest, the page and the matches all describe one document. The mount
// probe cannot cover a host that swaps the prop without remounting, so the
// document identity re-runs it and clears what belonged to the previous one.
watch(docId, async () => {
  preferMarkdown.value = true
  isMarkdownEmpty.value = false
  markdownOversized.value = false
  markdownPage.value = 1
  maxOffsetTranslations.value = {}
  syncedPages.value = []
  await loadDocumentContent()
})

watch(contentPipeline, async () => {
  await cookAllContentSlices()
  currentContentPage.value = getContentSlice({ offset: activeContentSliceOffset.value }).cookedContent
})

onMounted(async () => {
  // `finally`, because a mount step rejecting must not leave the flag stuck
  // `false` and suppress every later mode-flip search for this instance.
  try {
    await loadDocumentContent()
  }
  finally {
    isMounted = true
  }
})

// Shared with the `docId` watcher: this sequence describes a document, not a
// mount, and the host can swap the document without remounting.
async function loadDocumentContent() {
  await Promise.all([loadMaxOffset(), fetchManifest()])
  await syncPages()
  // Slices are keyed by offset alone, so a watcher woken by the reset above can
  // have cached one sliced against the length and page map of the previous
  // document. Only now are both of them known for this one.
  Object.keys(contentSlices).forEach(key => delete contentSlices[key])
  activeContentSliceOffset.value = 0
  currentContentPage.value = ''
  await activateContentSlice({ offset: 0 })
  // At mount the term has just been set and the composable is already about to
  // search it; a document swap leaves that same term describing another one.
  if (isMounted && hasLocalSearchTerms.value) {
    await refreshLocalSearch()
  }
}

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
// correspondence, so each side keeps its own last position.
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
    // An unaligned flip is a mode toggle, not a navigation: a page-1 reset here
    // would fire the `markdownPage` watcher and silently clear the "render
    // anyway" consent the reader just gave for the page they were on.
    if (aligned) {
      markdownPage.value = pageForOffset(activeContentSliceOffset.value)
    }
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

// One entry per occurrence. Text mode carries the byte offset the marks are
// keyed by and no page: the slice to activate is found from the offset, not
// from a page number. Markdown mode carries the page and the rank within it.
async function findMatches(term) {
  if (isMarkdownMode.value) {
    return findMarkdownMatches(term)
  }
  return findTextMatches(term)
}

async function findTextMatches(term) {
  try {
    const { offsets = [] } = await api.searchDocument(docIndex.value, docId.value, term, props.targetLanguage, docRouting.value)
    return offsets.map(offset => ({ offset }))
  }
  catch {
    return []
  }
}

async function findMarkdownMatches(term) {
  try {
    const { hits } = await api.searchStructurePages(docIndex.value, docId.value, term, docRouting.value)
    return flattenPageHits(hits, term)
  }
  catch {
    return []
  }
}

async function updateContent() {
  if (isMarkdownMode.value) {
    return updateMarkdownContent()
  }
  await activateContentSliceAround()
  await jumpToActiveLocalSearchTerm()
}

function updateMarkdownContent() {
  const match = localSearchMatches.value[localSearchIndex.value - 1]
  if (match) {
    markdownPage.value = match.page
  }
}

// One entry per occurrence, sorted by page, so the flat local search index maps
// straight to a page and a 1-based rank within that page. The order is imposed
// here rather than assumed of the response, since next/previous walks this list.
function flattenPageHits(hits, term) {
  return sortBy(hits ?? [], 'page').flatMap(({ page, count }) => {
    return range(count).map(nth => ({ page, nth: nth + 1, term }))
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
    <document-toolbox
      v-model="localSearchTerm"
      v-model:active-index="localSearchIndex"
      v-model:page="page"
      :document="document"
      :target-language="targetLanguage"
      :occurrences="localSearchOccurrences"
      :total-pages="showPagination ? nbPages : 0"
      :loading="isLoading || isLocalSearchLoading"
      :compact-threshold="compactThreshold"
      hook-prefix="document.content"
    >
      <template #dropdown>
        <document-content-dropdown
          v-if="hasMarkdown"
          v-model="preferMarkdown"
          :markdown-disabled="isMarkdownEmpty"
          :markdown-slow="markdownOversized"
          :translation="isTranslation"
          class="flex-shrink-0 ms-auto"
        />
      </template>
    </document-toolbox>
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
        :render-oversized="markdownOversized"
        @fallback="preferMarkdown = false"
        @empty="fallbackToTextForEmptyMarkdown"
        @oversized="markdownOversized = true; preferMarkdown = false"
        @rendered="markdownOversized = false"
      />
      <div
        v-else-if="hasExtractedContent"
        class="document-content__body"
        v-html="currentContentPage"
      />
      <div
        v-else-if="loadedOnce && !hasContentBodyHook"
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
