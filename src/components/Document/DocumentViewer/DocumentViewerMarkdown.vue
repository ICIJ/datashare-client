<script setup>
import { ref, useTemplateRef, watch } from 'vue'

import { useDocumentSource } from '@/composables/useDocumentSource'
import { useMarkdownAnchors } from '@/composables/useMarkdownAnchors'
import { renderMarkdownOffThread } from '@/utils/markdownOffThread'

/**
 * Display a Markdown document as safely-sanitized formatted HTML.
 */
const props = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object,
    default: null
  }
})

const { fetchSource } = useDocumentSource()

const contentRef = useTemplateRef('content')
const { scrollToAnchor } = useMarkdownAnchors(contentRef)

const html = ref('')
const error = ref(null)
const loading = ref(false)

let lastLoad = 0

async function load(document) {
  if (!document) {
    return
  }
  // Documents can swap while a slow render is in flight: only the newest load
  // may write, so a stale render cannot overwrite the document now on screen.
  const loadId = ++lastLoad
  loading.value = true
  error.value = null
  try {
    const source = await fetchSource(document, { responseType: 'text' })
    const rendered = await renderMarkdownOffThread(source)
    if (loadId === lastLoad) {
      html.value = rendered
    }
  }
  catch (e) {
    if (loadId === lastLoad) {
      error.value = e.message
    }
  }
  finally {
    if (loadId === lastLoad) {
      loading.value = false
    }
  }
}

// Re-fetch whenever the document changes, not only on mount, so navigating
// between markdown documents in the same viewer instance updates the content.
watch(() => props.document, load, { immediate: true })
</script>

<template>
  <div class="markdown-viewer py-3">
    <div
      v-if="error"
      class="markdown-viewer__error p-3 text-center"
    >
      {{ error }}
    </div>
    <div
      v-else-if="loading"
      class="markdown-viewer__loading p-3 text-center"
    >
      <b-spinner />
    </div>
    <!--
      Safe to use v-html here: `html` is the output of renderMarkdown(), which
      sanitizes the content (no raw HTML, no remote images, hardened links).
    -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      v-else
      ref="content"
      class="markdown-viewer__content markdown-body shadow-sm border p-3 mx-auto"
      @click="scrollToAnchor"
      v-html="html"
    />
  </div>
</template>

<style lang="scss">
.markdown-viewer {
  max-width: 100%;
  overflow-x: auto;

  &__content {
    max-width: 1012px;
  }
}
</style>
