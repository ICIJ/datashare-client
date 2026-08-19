<script setup>
import { ref, useTemplateRef, watch } from 'vue'

import { useDocumentSource } from '@/composables/useDocumentSource'
import { renderMarkdown } from '@/utils/markdown'

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
const html = ref('')
const error = ref(null)
const loading = ref(false)

async function load(document) {
  if (!document) {
    return
  }
  loading.value = true
  error.value = null
  try {
    const source = await fetchSource(document, { responseType: 'text' })
    html.value = await renderMarkdown(source)
  }
  catch (e) {
    error.value = e.message
  }
  finally {
    loading.value = false
  }
}

// The router keeps its state in the URL hash, so letting the browser follow a
// fragment link would replace the route and drop the reader out of the document.
// Scrolling to the target ourselves keeps in-document links (headings, GFM
// footnotes) working; external links do not match and open in their new tab.
function onContentClick(event) {
  const anchor = event.target.closest('a[href^="#"]')
  if (!anchor) {
    return
  }
  event.preventDefault()
  const id = decodeURIComponent(anchor.hash.slice(1))
  const candidates = contentRef.value?.querySelectorAll('[id]') ?? []
  // Matched on the id property rather than through a `#id` selector: ids come
  // from the document's own headings, so they can hold characters a selector
  // would have to escape.
  const target = [...candidates].find(element => element.id === id)
  target?.scrollIntoView()
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
      @click="onContentClick"
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
