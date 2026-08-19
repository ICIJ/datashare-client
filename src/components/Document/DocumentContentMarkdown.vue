<script setup>
import { computed, nextTick, reactive, ref, toRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { addSearchMarksClassInHtml } from '@/utils/strings'
import { renderMarkdown } from '@/utils/markdown'
import { useUtils } from '@/composables/useUtils'
import { usePipelinesStore } from '@/store/modules'
import { apiInstance as api } from '@/api/apiInstance'

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
  }
})

const emit = defineEmits(['fallback', 'empty'])

const { t } = useI18n()
const { getTermIndexColor } = useUtils()
const pipelinesStore = usePipelinesStore()
const elementRef = useTemplateRef('element')

const renderedPages = reactive({})
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
  const locallyMarked = addSearchMarksClassInHtml(html, props.term)
  // Global marks go on last so they nest inside the local ones, the order the
  // `extracted-text` pipeline chain produces for the plain text view. Unlike that
  // chain, a `regex` term is matched literally: this marker walks text nodes so it
  // never marks inside an href, which a regex over rendered HTML would.
  return props.globalSearchTerms.reduce((marked, { label }, index) => {
    const style = `border-color: ${getTermIndexColor(index)}`
    return addSearchMarksClassInHtml(marked, label, { className: 'global-search-term', style })
  }, locallyMarked)
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
  try {
    await renderPageOnce()
  }
  catch (failure) {
    loadError = failure
  }
  if (load !== lastPageLoad) {
    return
  }
  error.value = loadError
  loading.value = false
  if (!loadError) {
    reportEmptyPage()
  }
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

async function renderPageOnce() {
  // Capture the page and document once: re-reading `props` after the
  // `await` below could pick up values changed by navigation while this
  // fetch was in flight, and would write the response under the wrong key.
  const targetPage = props.page
  const targetCacheKey = cacheKeyFor(targetPage)
  // `in` (rather than a truthiness check) treats an already-cached empty
  // page as a hit instead of re-fetching it on every visit.
  if (targetCacheKey in renderedPages) {
    return
  }
  const { index, id, routing } = props.document
  const markdown = await api.getStructurePage(index, id, targetPage, routing)
  renderedPages[targetCacheKey] = await renderMarkdown(markdown)
}

// Plugins can transform the markdown body through the `markdown-text` category;
// core registers nothing under it, so by default this resolves to the marked
// HTML unchanged.
async function cookHtml(html) {
  cookedHtml.value = await pipelinesStore.applyPipelineChainByCategory('markdown-text')(html)
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
watch([() => props.page, () => props.document?.id], ([, id], [, previousId]) => {
  if (id !== previousId) {
    // Rendered pages are worth keeping while the reader pages through a document,
    // not once they have left it.
    Object.keys(renderedPages).forEach(key => delete renderedPages[key])
  }
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
      class="document-content-markdown__body"
      v-html="cookedHtml"
    />
  </div>
</template>

<style lang="scss" scoped>
.document-content-markdown {
  &__body {
    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-top: $spacer-lg;
      margin-bottom: $spacer;
      font-weight: $font-weight-semibold;
      line-height: 1.25;
    }

    :deep(h1) {
      font-size: 2rem;
      padding-bottom: 0.3em;
      border-bottom: 1px solid var(--bs-border-color-translucent);
    }

    :deep(h2) {
      font-size: 1.5rem;
      padding-bottom: 0.3em;
      border-bottom: 1px solid var(--bs-border-color-translucent);
    }

    :deep(h3) {
      font-size: 1.25rem;
    }

    :deep(h4) {
      font-size: 1rem;
    }

    :deep(h5) {
      font-size: 0.875rem;
    }

    :deep(h6) {
      font-size: 0.85rem;
      color: var(--bs-secondary-color);
    }

    :deep(table) {
      border-collapse: collapse;
      margin-bottom: $spacer;

      th,
      td {
        border: 1px solid var(--bs-border-color);
        padding: 6px 13px;
      }

      th {
        font-weight: $font-weight-semibold;
      }

      tr:nth-child(2n) {
        background-color: var(--bs-tertiary-bg);
      }
    }

    :deep(pre) {
      padding: $spacer;
      overflow-x: auto;
      background: var(--bs-tertiary-bg);
      border-radius: var(--bs-border-radius);
    }

    :deep(blockquote) {
      margin: 0;
      padding-left: $spacer;
      border-left: 4px solid var(--bs-border-color);
    }
  }
}
</style>
