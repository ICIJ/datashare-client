<script setup>
import { computed, nextTick, reactive, ref, toRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { addLocalSearchMarksClassInHtml } from '@/utils/strings'
import { renderMarkdown } from '@/utils/markdown'
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
  }
})

const emit = defineEmits(['fallback'])

const { t } = useI18n()
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
  return addLocalSearchMarksClassInHtml(renderedPages[cacheKeyFor(props.page)] ?? '', props.term)
})

async function loadPage() {
  error.value = null
  loading.value = true
  try {
    await renderPageOnce()
  }
  catch (loadError) {
    error.value = loadError
  }
  finally {
    loading.value = false
  }
}

async function renderPageOnce() {
  // Capture the page and document once: re-reading `props` after the
  // `await` below could pick up values changed by navigation while this
  // fetch was in flight, and would write the response under the wrong key.
  const targetPage = props.page
  const targetCacheKey = cacheKeyFor(targetPage)
  if (renderedPages[targetCacheKey]) {
    return
  }
  const { index, id, routing } = props.document
  const markdown = await api.getStructurePage(index, id, targetPage, routing)
  renderedPages[targetCacheKey] = await renderMarkdown(markdown)
}

// Plugins can transform the markdown body through the `markdown-text`
// category; core registers nothing under it, so by default this resolves
// to the marked HTML unchanged.
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

watch(toRef(props, 'page'), loadPage, { immediate: true })
// The page number can stay the same while the document itself changes (e.g.
// switching documents while both are on page 1), so the document identity
// needs its own watcher to trigger a reload.
watch(() => props.document?.id, loadPage)
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
      margin-top: $spacer;
    }

    :deep(table) {
      border-collapse: collapse;

      th,
      td {
        border: 1px solid var(--bs-border-color);
        padding: $spacer-xxs $spacer-xs;
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
