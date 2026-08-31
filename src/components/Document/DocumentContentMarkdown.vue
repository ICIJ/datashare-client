<script>
import { reactive } from 'vue'

// Module scope, so a Formatted/Plain toggle, which unmounts this component,
// does not throw away pages already downloaded and rendered. Both are cleared
// when the document changes, so they stay bounded to one document.
const renderedPages = reactive({})
// The markdown of pages the threshold refused to render, kept so consenting to
// one does not download it a second time.
const oversizedSources = {}
let cachedDocumentId = null

function switchPageCacheTo(documentId) {
  if (cachedDocumentId === documentId) {
    return
  }
  cachedDocumentId = documentId
  Object.keys(renderedPages).forEach(key => delete renderedPages[key])
  Object.keys(oversizedSources).forEach(key => delete oversizedSources[key])
}
</script>

<script setup>
import { computed, nextTick, ref, toRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { addSearchMarksClassesInHtml } from '@/utils/strings'
import { renderMarkdownOffThread } from '@/utils/markdownOffThread'
import { useMarkdownAnchors } from '@/composables/useMarkdownAnchors'
import { useUtils } from '@/composables/useUtils'
import { usePipelinesStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'
import settings from '@/utils/settings'

/**
 * Display one markdown structure page of a document, with local search marks.
 */
const props = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object,
    required: true
  },
  /**
   * The structure page to display (1-based)
   */
  page: {
    type: Number,
    default: 1
  },
  /**
   * Local search term to mark in the rendered page
   */
  term: {
    type: String,
    default: ''
  },
  /**
   * 1-based index of the mark to activate in this page, 0 for none
   */
  activeMatch: {
    type: Number,
    default: 0
  },
  /**
   * Terms of the global search to mark in the rendered page
   */
  globalSearchTerms: {
    type: Array,
    default: () => []
  },
  /**
   * Raw markdown size (in characters) above which a page is not rendered:
   * the component emits `oversized` and lets the parent decide. The default
   * lives in `settings.oversizedMarkdownThreshold`.
   */
  oversizedThreshold: {
    type: Number,
    default: settings.oversizedMarkdownThreshold
  },
  /**
   * Render a page even when it exceeds the threshold: the parent sets this
   * once the reader has explicitly asked for the formatted view again.
   */
  renderOversized: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['fallback', 'empty', 'oversized'])

const { t } = useI18n()
const { getTermIndexColor } = useUtils()
const pipelinesStore = usePipelinesStore()
const elementRef = useTemplateRef('element')
const { scrollToAnchor } = useMarkdownAnchors(elementRef)

const cookedHtml = ref('')
const error = ref(null)
const loading = ref(false)

// The cache is keyed by document identity as well as page number, so a
// document swap can never serve another document's cached page, and a
// response for a page/document pair can never land under a different one.
function cacheKeyFor(page) {
  return `${props.document.id}:${page}`
}

const markedHtml = computed(() => {
  const html = renderedPages[cacheKeyFor(props.page)] ?? ''
  const globalMarks = props.globalSearchTerms.map(({ label }, index) => {
    const style = `border-color: ${getTermIndexColor(index)}`
    return { term: label, className: 'global-search-term', style }
  })
  // Global marks come after the local one so they nest inside it, the order the
  // `extracted-text` pipeline chain produces for the plain text view. Unlike that
  // chain, a `regex` term is matched literally: this marker walks text nodes so it
  // never marks inside an href, which a regex over rendered HTML would. All of
  // them share one parse, so a page the reader forced open past the size
  // threshold does not pay a full parse per term on every keystroke.
  const marks = [{ term: props.term, className: 'local-search-term' }, ...globalMarks]
  return addSearchMarksClassesInHtml(html, marks)
})

// A legitimately empty structure page renders to an empty string, which is
// still a cache hit: falling back to it here (rather than re-deriving
// emptiness from `cookedHtml`, which updates only after the async pipeline
// resolves) keeps the no-content message free of the pipeline's own timing.
const hasPageContent = computed(() => !!renderedPages[cacheKeyFor(props.page)])

let lastPageLoad = 0

async function loadPage() {
  // A page switch (or a document switch, or a retry click) can start a new
  // `loadPage` while a previous one is still in flight. This counter mirrors
  // `lastContentSliceActivation`/`lastOccurrencesRetrieval` in
  // `DocumentContent.vue`: only the newest load may write the error and the
  // loading state, so a superseded one cannot clear the spinner of the call
  // that superseded it, nor report its failure over the page now on screen.
  const load = ++lastPageLoad
  error.value = null
  loading.value = true
  let loadError = null
  let status = null
  try {
    status = await renderPageOnce(load)
  }
  catch (failure) {
    loadError = failure
  }
  if (load !== lastPageLoad) {
    return
  }
  error.value = loadError
  loading.value = false
  if (loadError) {
    return
  }
  // An oversized page is deliberately left unrendered and uncached, so it must
  // not be mistaken for an empty one: `empty` permanently disables the
  // formatted option, `oversized` only steers the reader to plain text.
  if (status === 'oversized') {
    emit('oversized')
    return
  }
  reportEmptyPage()
}

// A page can legitimately be blank (a blank cover page in a scanned PDF) without
// saying anything about the artifact as a whole, so this only reports what it
// knows: the page it shows has no content. Whether that means the artifact holds
// no markdown at all is the parent's call, since it knows the page count.
// This is `empty` rather than `fallback` because the two are not equivalent to
// the parent: a fetch error can be retried, an empty artifact cannot.
function reportEmptyPage() {
  if (!hasPageContent.value) {
    emit('empty')
  }
}

async function fetchPageSource(cacheKey, page) {
  if (cacheKey in oversizedSources) {
    const source = oversizedSources[cacheKey]
    delete oversizedSources[cacheKey]
    return source
  }
  const { index, id, routing } = props.document
  return api.getStructurePage(index, id, page, routing)
}

async function renderPageOnce(load) {
  // Capture the page and document once: re-reading `props` after the
  // `await` below could pick up values changed by navigation while this
  // fetch was in flight, and would write the response under the wrong key.
  const targetPage = props.page
  const targetCacheKey = cacheKeyFor(targetPage)
  // `in` (rather than a truthiness check) treats an already-cached empty
  // page as a hit instead of re-fetching it on every visit.
  if (targetCacheKey in renderedPages) {
    return 'rendered'
  }
  const markdown = await fetchPageSource(targetCacheKey, targetPage)
  if ((markdown?.length ?? 0) > props.oversizedThreshold && !props.renderOversized) {
    oversizedSources[targetCacheKey] = markdown
    return 'oversized'
  }
  const html = await renderMarkdownOffThread(markdown)
  // A document swap cleared the cache while this render was in flight: writing
  // now would put an unreachable page back into it.
  if (load !== lastPageLoad) {
    return 'stale'
  }
  renderedPages[targetCacheKey] = html
  return 'rendered'
}

let lastCook = 0

// Plugins can transform the markdown body through the `markdown-text` category;
// core registers nothing under it, so by default this resolves to the marked
// HTML unchanged.
async function cookHtml(html) {
  // A registered pipeline can be asynchronous, so two cooks can overlap and
  // resolve out of order. Same counter pattern as `loadPage` above: only the
  // newest may write, otherwise a slower cook paints over the page on screen.
  const cook = ++lastCook
  const cooked = await pipelinesStore.applyPipelineChainByCategory('markdown-text')(html)
  if (cook !== lastCook) {
    return
  }
  cookedHtml.value = cooked
  await nextTick()
  activateMatch()
}

function activateMatch() {
  const marks = elementRef.value?.querySelectorAll('.local-search-term') ?? []
  marks.forEach(mark => mark.classList.remove('local-search-term--active'))
  if (!props.activeMatch || !marks.length) {
    return
  }
  // Counts come from the markdown source while marks come from the rendered
  // DOM, so the nth match may not exist here: clamp to the last mark rather
  // than highlighting nothing.
  const active = marks[Math.min(props.activeMatch, marks.length) - 1]
  active.classList.add('local-search-term--active')
  active.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' })
}

// The page number can stay the same while the document itself changes (both on
// page 1), and the page can change on its own, so the pair is watched together:
// two watchers would fire twice and issue the same request twice.
watch([() => props.page, () => props.document?.id], ([, id]) => {
  // Rendered pages are worth keeping while the reader pages through a document,
  // not once they have left it.
  switchPageCacheTo(id)
  loadPage()
}, { immediate: true })
watch(markedHtml, cookHtml, { immediate: true })
watch(toRef(props, 'activeMatch'), activateMatch, { flush: 'post' })
</script>

<template>
  <div
    ref="element"
    class="document-content-markdown"
  >
    <div
      v-if="loading"
      class="document-content-markdown__loading p-3 text-center"
    >
      <b-spinner />
    </div>
    <b-alert
      v-else-if="error"
      :model-value="true"
      variant="warning"
      class="document-content-markdown__error"
    >
      {{ t('documentContentMarkdown.error') }}
      <div class="mt-2 d-flex gap-2">
        <b-button
          size="sm"
          variant="outline-secondary"
          class="document-content-markdown__error__retry"
          @click="loadPage"
        >
          {{ t('documentContentMarkdown.retry') }}
        </b-button>
        <b-button
          size="sm"
          variant="outline-secondary"
          class="document-content-markdown__error__fallback"
          @click="emit('fallback')"
        >
          {{ t('documentContentMarkdown.fallback') }}
        </b-button>
      </div>
    </b-alert>
    <div
      v-else-if="!hasPageContent"
      class="document-content-markdown__no-content text-center p-3"
    >
      {{ t('documentContent.noContent') }}
    </div>
    <!--
      Safe to use v-html here: `cookedHtml` derives from renderMarkdown(), which
      sanitizes the content (no raw HTML, no remote images, hardened links),
      plus our own mark tags.
    -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      v-else
      class="document-content-markdown__body markdown-body"
      @click="scrollToAnchor"
      v-html="cookedHtml"
    />
  </div>
</template>

<style lang="scss">
.document-content-markdown__body {
  // Off-screen blocks skip layout and paint. Anchor jumps and mark
  // scrollIntoView still work: the browser renders the target on demand.
  > * {
    content-visibility: auto;
    contain-intrinsic-size: auto 300px;
  }
}
</style>
